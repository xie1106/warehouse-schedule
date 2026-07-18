const employees = [
    { id: '1', name: '谢焕君', department: '仓储部', position: '操作员', workDays: 4 },
    { id: '2', name: '陈文童', department: '仓储部', position: '操作员', workDays: 4 },
    { id: '3', name: '付新远', department: '仓储部', position: '操作员', workDays: 4 },
    { id: '4', name: '林创武', department: '仓储部', position: '操作员', workDays: 4 },
    { id: '5', name: '李亚景', department: '仓储部', position: '操作员', workDays: 4 },
    { id: '6', name: '迟喻阳', department: '仓储部', position: '操作员', workDays: 4 },
    { id: '7', name: '蒋能', department: '仓储部', position: '操作员', workDays: 4 },
    { id: '8', name: '林镇兴', department: '仓储部', position: '操作员', workDays: 4 },
    { id: '9', name: '林佗贵', department: '仓储部', position: '操作员', workDays: 4 },
    { id: '10', name: '吴兴义', department: '仓储部', position: '操作员', workDays: 4 },
    { id: '11', name: '吴兴浪', department: '仓储部', position: '操作员', workDays: 4 },
    { id: '12', name: '刘少东', department: '仓储部', position: '操作员', workDays: 4 },
    { id: '13', name: '陈安然', department: '仓储部', position: '操作员', workDays: 4 },
    { id: '14', name: '黄丽情', department: '仓储部', position: '操作员', workDays: 4 },
    { id: '15', name: '崔斯欣', department: '仓储部', position: '操作员', workDays: 4 },
];

const leaveTypes = [
    { id: 'designated', name: '指定休', color: 'bg-blue-500' },
    { id: 'compensatory', name: '调休', color: 'bg-green-500' },
    { id: 'leave', name: '请假', color: 'bg-red-500' },
    { id: 'annual', name: '年假', color: 'bg-purple-500' },
    { id: 'marriage', name: '婚假', color: 'bg-pink-500' },
    { id: '产检', name: '产检', color: 'bg-teal-500' },
    { id: 'maternity', name: '产假', color: 'bg-orange-500' },
];

const scheduleTypes = [
    { id: 'morning', name: '早班', color: 'bg-green-100 text-green-800' },
    { id: 'afternoon', name: '中班', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'night', name: '晚班', color: 'bg-indigo-100 text-indigo-800' },
    { id: 'rest', name: '休息', color: 'bg-gray-100 text-gray-600' },
    { id: 'holiday', name: '假期', color: 'bg-red-100 text-red-800' },
];

const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
};

const getMonthName = (month) => {
    const names = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    return names[month];
};

const getDayOfWeek = (year, month, day) => {
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    return days[new Date(year, month, day).getDay()];
};

const generateCalendar = (year, month) => {
    const days = [];
    const totalDays = getDaysInMonth(year, month);
    const firstDay = new Date(year, month, 1).getDay();
    
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }
    
    for (let i = 1; i <= totalDays; i++) {
        days.push({
            day: i,
            date: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
            dayOfWeek: getDayOfWeek(year, month, i),
        });
    }
    
    return days;
};

const generateSchedule = (selectedMonth) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const days = getDaysInMonth(year, month);
    const schedule = {};
    
    employees.forEach(emp => {
        schedule[emp.id] = {};
        for (let i = 1; i <= days; i++) {
            const date = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const dayOfWeek = new Date(year, month - 1, i).getDay();
            
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                schedule[emp.id][date] = 'rest';
            } else {
                const rand = Math.random();
                if (rand < 0.4) schedule[emp.id][date] = 'morning';
                else if (rand < 0.7) schedule[emp.id][date] = 'afternoon';
                else schedule[emp.id][date] = 'night';
            }
        }
    });
    
    return schedule;
};

const generateExcel = (schedule, month) => {
    const [year, m] = month.split('-').map(Number);
    const days = getDaysInMonth(year, m - 1);
    
    let html = '<table border="1"><tr><th>员工</th>';
    for (let i = 1; i <= days; i++) {
        html += `<th>${i}</th>`;
    }
    html += '</tr>';
    
    employees.forEach(emp => {
        html += `<tr><td>${emp.name}</td>`;
        for (let i = 1; i <= days; i++) {
            const date = `${year}-${String(m).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const type = schedule[emp.id]?.[date] || 'rest';
            const typeName = scheduleTypes.find(t => t.id === type)?.name || '休息';
            html += `<td>${typeName}</td>`;
        }
        html += '</tr>';
    });
    html += '</table>';
    
    const blob = new Blob(['\uFEFF' + html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${year}年${m}月排班表.xls`;
    a.click();
    URL.revokeObjectURL(url);
};