const state = {
    currentPage: 'home',
    selectedMonth: new Date().toISOString().slice(0, 7),
    selectedEmployee: employees[0].id,
    currentUserId: employees[0].id,
    selectedLeaveType: 'designated',
    leaveData: {},
    scheduleData: {},
    submittedEmployees: new Set(),
    userRole: 'admin',
};

const loadState = () => {
    try {
        const saved = localStorage.getItem('warehouseSchedule');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.leaveData) state.leaveData = parsed.leaveData;
            if (parsed.submittedEmployees) state.submittedEmployees = new Set(parsed.submittedEmployees);
            if (parsed.currentUserId) state.currentUserId = parsed.currentUserId;
            if (parsed.userRole) state.userRole = parsed.userRole;
            if (parsed.selectedMonth) state.selectedMonth = parsed.selectedMonth;
            if (parsed.selectedEmployee) state.selectedEmployee = parsed.selectedEmployee;
        }
    } catch (e) {
        console.error('Failed to load state:', e);
    }
};

const saveState = () => {
    try {
        localStorage.setItem('warehouseSchedule', JSON.stringify({
            leaveData: state.leaveData,
            submittedEmployees: Array.from(state.submittedEmployees),
            currentUserId: state.currentUserId,
            userRole: state.userRole,
            selectedMonth: state.selectedMonth,
            selectedEmployee: state.selectedEmployee,
        }));
    } catch (e) {
        console.error('Failed to save state:', e);
    }
};

const initLeaveData = () => {
    employees.forEach(emp => {
        if (!state.leaveData[emp.id]) {
            state.leaveData[emp.id] = {};
        }
    });
};

const toggleLeave = (date) => {
    const empId = state.userRole === 'admin' ? state.selectedEmployee : state.currentUserId;
    if (!state.leaveData[empId]) state.leaveData[empId] = {};
    
    if (state.leaveData[empId][date]) {
        delete state.leaveData[empId][date];
    } else {
        state.leaveData[empId][date] = state.selectedLeaveType;
    }
    saveState();
    render();
};

const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-20 right-4 z-50 px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2 transition-all duration-300 transform translate-y-0 opacity-100 ${
        type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    toast.innerHTML = `
        <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}" class="w-5 h-5"></i>
        <span class="font-medium">${message}</span>
    `;
    document.body.appendChild(toast);
    lucide.createIcons();
    
    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('-translate-y-4', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

const submitLeave = () => {
    const empId = state.userRole === 'admin' ? state.selectedEmployee : state.currentUserId;
    state.submittedEmployees.add(empId);
    saveState();
    showToast('休假申请提交成功！');
    render();
};

const generateAndRenderSchedule = () => {
    state.scheduleData = generateSchedule(state.selectedMonth);
    state.currentPage = 'schedule';
    saveState();
    render();
};

const updateScheduleCell = (empId, date, type) => {
    if (!state.scheduleData[empId]) state.scheduleData[empId] = {};
    state.scheduleData[empId][date] = type;
    saveState();
    render();
};

const renderHeader = () => {
    return `
        <header class="bg-white shadow-sm sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                            <i data-lucide="calendar-days" class="text-white w-6 h-6"></i>
                        </div>
                        <div>
                            <h1 class="text-xl font-bold text-gray-800">捷展云仓</h1>
                            <p class="text-xs text-gray-500">智能排班系统</p>
                        </div>
                    </div>
                    
                    <nav class="hidden md:flex space-x-1">
                        ${['home', 'leave', 'schedule', 'employees'].map(page => {
                            const titles = { home: '首页', leave: '休假收集', schedule: '排班表', employees: '员工管理' };
                            const isActive = state.currentPage === page;
                            return `
                                <button 
                                    onclick="state.currentPage='${page}';saveState();render()"
                                    class="px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        isActive 
                                            ? 'bg-blue-100 text-blue-700' 
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }"
                                >
                                    ${titles[page]}
                                </button>
                            `;
                        }).join('')}
                    </nav>

                    <div class="flex items-center space-x-3">
                        <div class="text-sm text-gray-600">
                            ${state.userRole === 'admin' ? '管理员' : '员工'}
                        </div>
                        <button 
                            onclick="state.userRole = state.userRole === 'admin' ? 'employee' : 'admin';saveState();render()"
                            class="px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                            切换身份
                        </button>
                    </div>
                </div>
            </div>
        </header>
    `;
};

const renderHome = () => {
    const totalEmployees = employees.length;
    const submittedCount = state.submittedEmployees.size;
    const pendingCount = totalEmployees - submittedCount;
    
    return `
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div 
                    onclick="state.currentPage='leave';saveState();render()"
                    class="glass-card rounded-2xl p-6 cursor-pointer stat-card animate-fadeIn"
                    style="animation-delay: 0.1s"
                >
                    <div class="flex items-start justify-between">
                        <div>
                            <div class="flex items-center space-x-2 mb-2">
                                <span class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <i data-lucide="calendar-check" class="text-blue-600 w-5 h-5"></i>
                                </span>
                                <span class="text-sm font-medium text-blue-600">休假收集</span>
                            </div>
                            <h3 class="text-2xl font-bold text-gray-800 mb-2">提交截止时间</h3>
                            <p class="text-lg text-orange-500 font-semibold">25日</p>
                        </div>
                        <div class="bg-blue-50 rounded-full px-4 py-2">
                            <span class="text-sm font-medium text-blue-700">${submittedCount}/${totalEmployees} 已提交</span>
                        </div>
                    </div>
                    <div class="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                            class="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                            style="width: ${(submittedCount / totalEmployees) * 100}%"
                        ></div>
                    </div>
                </div>

                <div 
                    onclick="generateAndRenderSchedule()"
                    class="glass-card rounded-2xl p-6 cursor-pointer stat-card animate-fadeIn"
                    style="animation-delay: 0.2s"
                >
                    <div class="flex items-start justify-between">
                        <div>
                            <div class="flex items-center space-x-2 mb-2">
                                <span class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                    <i data-lucide="zap" class="text-green-600 w-5 h-5"></i>
                                </span>
                                <span class="text-sm font-medium text-green-600">智能排班</span>
                            </div>
                            <h3 class="text-2xl font-bold text-gray-800 mb-2">一键生成</h3>
                            <p class="text-gray-500">智能排班 · 手动调整 · 导出Excel</p>
                        </div>
                        <div class="bg-green-50 rounded-full px-4 py-2">
                            <span class="text-sm font-medium text-green-700">${state.selectedMonth}</span>
                        </div>
                    </div>
                    <div class="mt-4 flex space-x-2">
                        <button 
                            onclick="generateAndRenderSchedule()"
                            class="flex-1 btn-primary text-white py-2.5 rounded-xl font-medium text-sm"
                        >
                            立即生成
                        </button>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="glass-card rounded-xl p-5 stat-card animate-fadeIn" style="animation-delay: 0.3s">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-500 mb-1">本月应休天数</p>
                            <p class="text-3xl font-bold text-gray-800 animate-countUp">4</p>
                        </div>
                        <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                            <i data-lucide="clock" class="text-blue-600 w-6 h-6"></i>
                        </div>
                    </div>
                </div>

                <div class="glass-card rounded-xl p-5 stat-card animate-fadeIn" style="animation-delay: 0.4s">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-500 mb-1">已提交</p>
                            <p class="text-3xl font-bold text-green-600 animate-countUp">${submittedCount}</p>
                        </div>
                        <div class="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                            <i data-lucide="check-circle" class="text-green-600 w-6 h-6"></i>
                        </div>
                    </div>
                </div>

                <div class="glass-card rounded-xl p-5 stat-card animate-fadeIn" style="animation-delay: 0.5s">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-500 mb-1">未提交</p>
                            <p class="text-3xl font-bold text-orange-500 animate-countUp">${pendingCount}</p>
                        </div>
                        <div class="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                            <i data-lucide="alert-circle" class="text-orange-500 w-6 h-6"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div class="glass-card rounded-xl p-6 animate-fadeIn" style="animation-delay: 0.6s">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-800">提交详情</h3>
                    <button onclick="state.currentPage='leave';saveState();render()" class="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        查看全部
                    </button>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    ${employees.slice(0, 10).map((emp) => {
                        const isSubmitted = state.submittedEmployees.has(emp.id);
                        return `
                            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span class="text-sm font-medium text-gray-700">${emp.name}</span>
                                <span class="${isSubmitted ? 'text-green-500' : 'text-gray-400'} text-xs">
                                    ${isSubmitted ? '已提交' : '未提交'}
                                </span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </main>
    `;
};

const renderLeave = () => {
    const [year, month] = state.selectedMonth.split('-').map(Number);
    const calendarDays = generateCalendar(year, month - 1);
    
    const currentEmpId = state.userRole === 'admin' ? state.selectedEmployee : state.currentUserId;
    const selectedEmp = employees.find(e => e.id === currentEmpId);
    const empLeaveData = state.leaveData[currentEmpId] || {};
    const selectedDates = Object.keys(empLeaveData);
    const isSubmitted = state.submittedEmployees.has(currentEmpId);
    
    return `
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">休假收集</h2>
                    <p class="text-gray-500">${state.userRole === 'admin' ? '选择员工和月份，在日历上标记假期' : '请选择您的休假日期'}</p>
                </div>
                <button onclick="state.currentPage='home';saveState();render()" class="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors">
                    <i data-lucide="arrow-left" class="w-4 h-4"></i>
                    <span class="text-sm">返回首页</span>
                </button>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 space-y-6">
                    <div class="glass-card rounded-xl p-6">
                        <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <div class="flex items-center space-x-4">
                                ${state.userRole === 'admin' ? `
                                <div>
                                    <label class="text-sm text-gray-500 mb-1 block">选择员工</label>
                                    <select 
                                        onchange="state.selectedEmployee=this.value;saveState();render()"
                                        class="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    >
                                        ${employees.map(emp => `
                                            <option value="${emp.id}" ${state.selectedEmployee === emp.id ? 'selected' : ''}>
                                                ${emp.name}
                                            </option>
                                        `).join('')}
                                    </select>
                                </div>
                                ` : `
                                <div>
                                    <label class="text-sm text-gray-500 mb-1 block">当前员工</label>
                                    <div class="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                                        ${selectedEmp?.name}
                                    </div>
                                </div>
                                `}
                                <div>
                                    <label class="text-sm text-gray-500 mb-1 block">选择月份</label>
                                    <input 
                                        type="month" 
                                        value="${state.selectedMonth}"
                                        onchange="state.selectedMonth=this.value;saveState();render()"
                                        class="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div class="text-sm text-gray-600">
                                本月应休天数：<span class="font-bold text-blue-600">${selectedEmp?.workDays}天</span>
                                <span class="text-gray-400 ml-2">(指定休不超过此数)</span>
                            </div>
                        </div>

                        <div class="mb-4">
                            <label class="text-sm text-gray-500 mb-2 block">假期类型</label>
                            <div class="flex flex-wrap gap-2">
                                ${leaveTypes.map(type => `
                                    <button 
                                        onclick="state.selectedLeaveType='${type.id}';saveState();render()"
                                        class="px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                            state.selectedLeaveType === type.id 
                                                ? 'bg-gray-800 text-white' 
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }"
                                    >
                                        ${type.name}
                                    </button>
                                `).join('')}
                            </div>
                        </div>

                        <div class="grid grid-cols-7 gap-2">
                            ${['日', '一', '二', '三', '四', '五', '六'].map(day => `
                                <div class="text-center py-2 text-sm font-semibold text-gray-500">${day}</div>
                            `).join('')}
                            ${calendarDays.map((day, idx) => {
                                if (!day) return '<div class="h-16"></div>';
                                
                                const isSelected = selectedDates.includes(day.date);
                                const leaveType = isSelected ? empLeaveData[day.date] : null;
                                const leaveTypeInfo = leaveTypes.find(t => t.id === leaveType);
                                
                                return `
                                    <button 
                                        onclick="toggleLeave('${day.date}')"
                                        class="h-16 rounded-xl border transition-all calendar-day flex flex-col items-center justify-center relative ${
                                            isSelected 
                                                ? `${leaveTypeInfo?.color} text-white border-transparent` 
                                                : 'bg-white border-gray-100 hover:border-blue-300 hover:bg-blue-50'
                                        }"
                                    >
                                        <span class="text-sm font-medium">${day.day}</span>
                                        ${isSelected ? `
                                            <span class="text-xs mt-0.5 opacity-80">${leaveTypeInfo?.name}</span>
                                        ` : ''}
                                    </button>
                                `;
                            }).join('')}
                        </div>

                        <div class="mt-6 flex items-center justify-between">
                            <div>
                                <span class="text-sm text-gray-500">已选日期：</span>
                                <span class="text-sm font-medium text-gray-700">${selectedDates.length}天</span>
                                ${isSubmitted ? `<span class="ml-2 text-sm text-green-600 flex items-center"><i data-lucide="check-circle" class="w-4 h-4 mr-1"></i>已提交</span>` : ''}
                            </div>
                            <button 
                                onclick="submitLeave()"
                                ${isSubmitted ? 'disabled' : ''}
                                class="px-6 py-2.5 rounded-xl font-medium transition-all ${
                                    isSubmitted 
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                        : 'btn-primary text-white'
                                }"
                            >
                                ${isSubmitted ? '已提交休假申请' : '提交休假申请'}
                            </button>
                        </div>
                    </div>
                </div>

                <div class="space-y-6">
                    <div class="glass-card rounded-xl p-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <i data-lucide="bar-chart-3" class="w-5 h-5 mr-2 text-blue-600"></i>
                            提交统计
                        </h3>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="text-center p-4 bg-green-50 rounded-xl">
                                <p class="text-3xl font-bold text-green-600">${state.submittedEmployees.size}</p>
                                <p class="text-sm text-gray-600 mt-1">已提交</p>
                            </div>
                            <div class="text-center p-4 bg-orange-50 rounded-xl">
                                <p class="text-3xl font-bold text-orange-500">${employees.length - state.submittedEmployees.size}</p>
                                <p class="text-sm text-gray-600 mt-1">未提交</p>
                            </div>
                        </div>
                    </div>

                    <div class="glass-card rounded-xl p-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <i data-lucide="list-checks" class="w-5 h-5 mr-2 text-blue-600"></i>
                            提交详情
                        </h3>
                        <div class="space-y-2 max-h-80 overflow-y-auto">
                            ${employees.map((emp) => {
                                const isSubmitted = state.submittedEmployees.has(emp.id);
                                return `
                                    <div class="flex items-center justify-between p-2 rounded-lg ${isSubmitted ? 'bg-green-50' : 'bg-gray-50'}">
                                        <span class="text-sm text-gray-700">${emp.name}</span>
                                        <span class="${isSubmitted ? 'text-green-600' : 'text-gray-400'} text-xs font-medium">
                                            ${isSubmitted ? '已提交' : '未提交'}
                                        </span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    `;
};

const renderSchedule = () => {
    const [year, month] = state.selectedMonth.split('-').map(Number);
    const days = getDaysInMonth(year, month - 1);
    const calendarDays = generateCalendar(year, month - 1);
    
    if (Object.keys(state.scheduleData).length === 0) {
        state.scheduleData = generateSchedule(state.selectedMonth);
    }

    return `
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">排班表</h2>
                    <p class="text-gray-500">${year}年${month}月排班情况</p>
                </div>
                <div class="flex items-center space-x-3">
                    <input 
                        type="month" 
                        value="${state.selectedMonth}"
                        onchange="state.selectedMonth=this.value;state.scheduleData={};saveState();render()"
                        class="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <button onclick="state.currentPage='home';saveState();render()" class="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors">
                        <i data-lucide="arrow-left" class="w-4 h-4"></i>
                        <span class="text-sm">返回</span>
                    </button>
                </div>
            </div>

            <div class="glass-card rounded-xl p-6 mb-6">
                <div class="flex flex-wrap items-center justify-between gap-4">
                    <div class="flex flex-wrap gap-2">
                        <button 
                            onclick="state.scheduleData=generateSchedule(state.selectedMonth);saveState();render()"
                            class="btn-primary text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center space-x-2"
                        >
                            <i data-lucide="refresh-cw" class="w-4 h-4"></i>
                            <span>一键生成排班</span>
                        </button>
                        <button 
                            onclick="render()"
                            class="btn-secondary text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center space-x-2"
                        >
                            <i data-lucide="check" class="w-4 h-4"></i>
                            <span>确认排班</span>
                        </button>
                        <button 
                            onclick="generateExcel(state.scheduleData, state.selectedMonth)"
                            class="px-4 py-2 border border-gray-200 rounded-lg font-medium text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        >
                            <i data-lucide="download" class="w-4 h-4"></i>
                            <span>导出Excel</span>
                        </button>
                    </div>
                    <div class="flex items-center space-x-4">
                        ${scheduleTypes.map(type => `
                            <div class="flex items-center space-x-1">
                                <span class="w-3 h-3 rounded ${type.color.split(' ')[0]}"></span>
                                <span class="text-xs text-gray-600">${type.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div class="glass-card rounded-xl overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="bg-gray-50">
                                <th class="sticky left-0 bg-gray-50 px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-100">
                                    员工
                                </th>
                                ${Array.from({ length: days }, (_, i) => {
                                    const date = `${year}-${String(month).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
                                    const dayInfo = calendarDays.find(d => d?.date === date);
                                    const isWeekend = dayInfo?.dayOfWeek === '日' || dayInfo?.dayOfWeek === '六';
                                    return `
                                        <th class="px-2 py-3 text-center text-sm font-semibold ${isWeekend ? 'text-red-500' : 'text-gray-700'} border-b border-gray-100">
                                            <div>${i + 1}</div>
                                            <div class="text-xs opacity-60">${dayInfo?.dayOfWeek}</div>
                                        </th>
                                    `;
                                }).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${employees.map(emp => `
                                <tr class="hover:bg-gray-50 transition-colors">
                                    <td class="sticky left-0 bg-white px-4 py-2 text-sm font-medium text-gray-800 border-b border-gray-100">
                                        ${emp.name}
                                    </td>
                                    ${Array.from({ length: days }, (_, i) => {
                                        const date = `${year}-${String(month).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
                                        const scheduleType = state.scheduleData[emp.id]?.[date] || 'rest';
                                        const typeInfo = scheduleTypes.find(t => t.id === scheduleType);
                                        const isWeekend = calendarDays.find(d => d?.date === date)?.dayOfWeek === '日' || 
                                                          calendarDays.find(d => d?.date === date)?.dayOfWeek === '六';
                                        
                                        return `
                                            <td class="px-1 py-1 border-b border-gray-100">
                                                <button 
                                                    onclick="const types=['morning','afternoon','night','rest'];const current=types.indexOf('${scheduleType}');updateScheduleCell('${emp.id}','${date}',types[(current+1)%types.length])"
                                                    class="w-full h-full min-h-[40px] py-1 rounded-lg text-xs font-medium ${typeInfo?.color} schedule-cell ${isWeekend ? 'font-semibold' : ''}"
                                                >
                                                    ${typeInfo?.name}
                                                </button>
                                            </td>
                                        `;
                                    }).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="mt-6 glass-card rounded-xl p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">排班说明</h3>
                <ul class="space-y-2 text-sm text-gray-600">
                    <li class="flex items-start">
                        <i data-lucide="info" class="w-4 h-4 mr-2 text-blue-500 mt-0.5"></i>
                        <span>点击表格中的单元格可以快速切换班次类型</span>
                    </li>
                    <li class="flex items-start">
                        <i data-lucide="info" class="w-4 h-4 mr-2 text-blue-500 mt-0.5"></i>
                        <span>周六、周日默认为休息日，可根据实际情况调整</span>
                    </li>
                    <li class="flex items-start">
                        <i data-lucide="info" class="w-4 h-4 mr-2 text-blue-500 mt-0.5"></i>
                        <span>确认排班后数据将被锁定，如需修改请重新生成</span>
                    </li>
                </ul>
            </div>
        </main>
    `;
};

const renderEmployees = () => {
    return `
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">员工管理</h2>
                    <p class="text-gray-500">管理仓库员工信息</p>
                </div>
                <div class="flex items-center space-x-3">
                    <button 
                        onclick="state.currentPage='home';saveState();render()" 
                        class="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <i data-lucide="arrow-left" class="w-4 h-4"></i>
                        <span class="text-sm">返回首页</span>
                    </button>
                    <button 
                        onclick="showAddEmployeeModal()"
                        class="btn-primary text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center space-x-2"
                    >
                        <i data-lucide="plus" class="w-4 h-4"></i>
                        <span>新增员工</span>
                    </button>
                </div>
            </div>

            <div class="glass-card rounded-xl overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="bg-gray-50">
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-100">ID</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-100">姓名</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-100">部门</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-100">职位</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-100">月应休天数</th>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-100">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${employees.map((emp, idx) => `
                                <tr class="hover:bg-gray-50 transition-colors">
                                    <td class="px-4 py-3 text-sm text-gray-500 border-b border-gray-100">${String(idx + 1).padStart(3, '0')}</td>
                                    <td class="px-4 py-3 text-sm font-medium text-gray-800 border-b border-gray-100">${emp.name}</td>
                                    <td class="px-4 py-3 text-sm text-gray-600 border-b border-gray-100">${emp.department}</td>
                                    <td class="px-4 py-3 text-sm text-gray-600 border-b border-gray-100">${emp.position}</td>
                                    <td class="px-4 py-3 text-sm text-gray-600 border-b border-gray-100">${emp.workDays}天</td>
                                    <td class="px-4 py-3 border-b border-gray-100">
                                        <div class="flex items-center space-x-2">
                                            <button 
                                                onclick="showEditEmployeeModal('${emp.id}')"
                                                class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <i data-lucide="edit" class="w-4 h-4"></i>
                                            </button>
                                            <button 
                                                onclick="deleteEmployee('${emp.id}')"
                                                class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="mt-6 glass-card rounded-xl p-6">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="text-center p-4">
                        <p class="text-3xl font-bold text-blue-600">${employees.length}</p>
                        <p class="text-sm text-gray-500 mt-1">总员工数</p>
                    </div>
                    <div class="text-center p-4">
                        <p class="text-3xl font-bold text-green-600">${employees.filter(e => e.department === '仓储部').length}</p>
                        <p class="text-sm text-gray-500 mt-1">仓储部</p>
                    </div>
                    <div class="text-center p-4">
                        <p class="text-3xl font-bold text-purple-600">${employees.filter(e => e.position === '操作员').length}</p>
                        <p class="text-sm text-gray-500 mt-1">操作员</p>
                    </div>
                    <div class="text-center p-4">
                        <p class="text-3xl font-bold text-orange-600">4</p>
                        <p class="text-sm text-gray-500 mt-1">平均应休天数</p>
                    </div>
                </div>
            </div>
        </main>
    `;
};

const showAddEmployeeModal = () => {
    alert('新增员工功能：填写员工姓名、部门、职位和应休天数');
};

const showEditEmployeeModal = (id) => {
    const emp = employees.find(e => e.id === id);
    alert(`编辑员工：${emp?.name}`);
};

const deleteEmployee = (id) => {
    if (confirm('确定要删除该员工吗？')) {
        const idx = employees.findIndex(e => e.id === id);
        if (idx > -1) {
            employees.splice(idx, 1);
            saveState();
            render();
        }
    }
};

const render = () => {
    const app = document.getElementById('app');
    let content = '';
    
    content += renderHeader();
    
    switch (state.currentPage) {
        case 'home':
            content += renderHome();
            break;
        case 'leave':
            content += renderLeave();
            break;
        case 'schedule':
            content += renderSchedule();
            break;
        case 'employees':
            content += renderEmployees();
            break;
        default:
            content += renderHome();
    }
    
    app.innerHTML = content;
    lucide.createIcons();
};

loadState();
initLeaveData();
render();