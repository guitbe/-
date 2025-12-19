// 탭 전환 기능
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // 모든 탭 버튼과 콘텐츠 비활성화
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // 선택한 탭 활성화
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // 저장된 계산 내역 불러오기
    loadSavedCalculations();
});

// 숫자 포맷팅 함수
function formatNumber(num) {
    return new Intl.NumberFormat('ko-KR').format(Math.round(num));
}

// 4대보험 계산 함수
function calculateInsurance(monthlySalary, hasInsurance = true) {
    if (!hasInsurance) {
        return {
            pension: 0,
            health: 0,
            employment: 0,
            industrial: 0,
            total: 0
        };
    }

    // 보험료 계산 기준 (2024년 기준)
    const pensionRate = 0.045; // 국민연금 4.5%
    const healthRate = 0.03545; // 건강보험 3.545%
    const employmentRate = 0.009; // 고용보험 0.9%
    const industrialRate = 0.0008; // 산재보험 0.08%

    // 상한액 적용 (2024년 기준)
    const maxPension = 5530000; // 국민연금 상한액
    const maxHealth = 5530000; // 건강보험 상한액
    const maxEmployment = 5530000; // 고용보험 상한액
    const maxIndustrial = 88000000; // 산재보험 상한액

    const pensionBase = Math.min(monthlySalary, maxPension);
    const healthBase = Math.min(monthlySalary, maxHealth);
    const employmentBase = Math.min(monthlySalary, maxEmployment);
    const industrialBase = Math.min(monthlySalary, maxIndustrial);

    const pension = pensionBase * pensionRate;
    const health = healthBase * healthRate;
    const employment = employmentBase * employmentRate;
    const industrial = industrialBase * industrialRate;

    return {
        pension: Math.round(pension),
        health: Math.round(health),
        employment: Math.round(employment),
        industrial: Math.round(industrial),
        total: Math.round(pension + health + employment + industrial)
    };
}

// 소득세 계산 함수
function calculateIncomeTax(annualSalary, familyCount) {
    // 4대보험 공제
    const monthlySalary = annualSalary / 12;
    const insurance = calculateInsurance(monthlySalary);
    const annualInsurance = insurance.total * 12;
    
    // 근로소득 공제
    const workDeduction = calculateWorkDeduction(annualSalary);
    
    // 인적 공제
    const personalDeduction = 1500000; // 기본공제
    const familyDeduction = (familyCount - 1) * 1500000; // 부양가족 공제
    
    // 과세표준
    const taxBase = Math.max(0, annualSalary - annualInsurance - workDeduction - personalDeduction - familyDeduction);
    
    // 소득세 계산 (누진세율)
    let incomeTax = 0;
    if (taxBase <= 12000000) {
        incomeTax = taxBase * 0.06;
    } else if (taxBase <= 46000000) {
        incomeTax = 12000000 * 0.06 + (taxBase - 12000000) * 0.15;
    } else if (taxBase <= 88000000) {
        incomeTax = 12000000 * 0.06 + 34000000 * 0.15 + (taxBase - 46000000) * 0.24;
    } else if (taxBase <= 150000000) {
        incomeTax = 12000000 * 0.06 + 34000000 * 0.15 + 42000000 * 0.24 + (taxBase - 88000000) * 0.35;
    } else {
        incomeTax = 12000000 * 0.06 + 34000000 * 0.15 + 42000000 * 0.24 + 62000000 * 0.35 + (taxBase - 150000000) * 0.38;
    }
    
    // 지방소득세 (소득세의 10%)
    const localTax = Math.round(incomeTax * 0.1);
    
    return {
        taxBase: Math.round(taxBase),
        incomeTax: Math.round(incomeTax),
        localTax: localTax,
        totalTax: Math.round(incomeTax + localTax)
    };
}

// 근로소득 공제 계산
function calculateWorkDeduction(annualSalary) {
    if (annualSalary <= 5000000) {
        return annualSalary * 0.7;
    } else if (annualSalary <= 15000000) {
        return 3500000 + (annualSalary - 5000000) * 0.4;
    } else if (annualSalary <= 45000000) {
        return 7500000 + (annualSalary - 15000000) * 0.15;
    } else if (annualSalary <= 100000000) {
        return 12000000 + (annualSalary - 45000000) * 0.1;
    } else {
        return 17500000 + (annualSalary - 100000000) * 0.05;
    }
}

// 연봉 계산기 메인 함수
function calculateSalary() {
    const annualSalary = parseFloat(document.getElementById('annualSalary').value);
    const familyCount = parseInt(document.getElementById('familyCount').value) || 1;
    const hasInsurance = document.getElementById('hasInsurance').value === 'true';

    if (!annualSalary || annualSalary <= 0) {
        alert('연봉을 입력해주세요.');
        return;
    }

    const monthlySalary = annualSalary / 12;
    const insurance = calculateInsurance(monthlySalary, hasInsurance);
    const tax = calculateIncomeTax(annualSalary, familyCount);
    
    const monthlyInsurance = insurance.total;
    const monthlyTax = tax.totalTax / 12;
    const netMonthlySalary = monthlySalary - monthlyInsurance - monthlyTax;
    const netAnnualSalary = netMonthlySalary * 12;

    // 결과 표시
    document.getElementById('monthlySalary').textContent = formatNumber(monthlySalary) + '원';
    document.getElementById('insurance').textContent = formatNumber(monthlyInsurance) + '원';
    document.getElementById('incomeTax').textContent = formatNumber(tax.incomeTax / 12) + '원';
    document.getElementById('localTax').textContent = formatNumber(tax.localTax / 12) + '원';
    document.getElementById('netSalary').textContent = formatNumber(netMonthlySalary) + '원';
    
    document.getElementById('salaryResult').style.display = 'block';

    // 차트 그리기
    drawSalaryChart(monthlySalary, monthlyInsurance, monthlyTax, netMonthlySalary);
}

// 퇴직금 계산기
function calculateRetirement() {
    const monthlySalary = parseFloat(document.getElementById('retirementSalary').value);
    const workYears = parseFloat(document.getElementById('workYears').value);

    if (!monthlySalary || monthlySalary <= 0) {
        alert('평균임금을 입력해주세요.');
        return;
    }

    if (!workYears || workYears <= 0) {
        alert('근무년수를 입력해주세요.');
        return;
    }

    // 퇴직금 = 평균임금 × 30일 × 근무년수
    const retirementAmount = monthlySalary * 30 * workYears;
    const workDays = Math.round(workYears * 365);

    document.getElementById('retirementAmount').textContent = formatNumber(retirementAmount) + '원';
    document.getElementById('workDays').textContent = formatNumber(workDays) + '일';
    document.getElementById('retirementResult').style.display = 'block';
}

// 연차수당 계산기
function calculateAnnual() {
    const monthlySalary = parseFloat(document.getElementById('annualMonthlySalary').value);
    const annualDays = parseInt(document.getElementById('annualDays').value);

    if (!monthlySalary || monthlySalary <= 0) {
        alert('월 급여를 입력해주세요.');
        return;
    }

    if (!annualDays || annualDays <= 0) {
        alert('연차일수를 입력해주세요.');
        return;
    }

    // 일 평균 급여 = 월 급여 / 30일
    const dailySalary = monthlySalary / 30;
    const annualAmount = dailySalary * annualDays;

    document.getElementById('annualAmount').textContent = formatNumber(annualAmount) + '원';
    document.getElementById('dailySalary').textContent = formatNumber(dailySalary) + '원';
    document.getElementById('annualResult').style.display = 'block';
}

// 세금 상세 분석
function calculateTaxDetail() {
    const annualSalary = parseFloat(document.getElementById('taxSalary').value);
    const familyCount = parseInt(document.getElementById('taxFamilyCount').value) || 1;

    if (!annualSalary || annualSalary <= 0) {
        alert('연봉을 입력해주세요.');
        return;
    }

    const monthlySalary = annualSalary / 12;
    const insurance = calculateInsurance(monthlySalary);
    const tax = calculateIncomeTax(annualSalary, familyCount);

    document.getElementById('taxBase').textContent = formatNumber(tax.taxBase) + '원';
    document.getElementById('taxIncomeTax').textContent = formatNumber(tax.incomeTax) + '원';
    document.getElementById('taxLocalTax').textContent = formatNumber(tax.localTax) + '원';
    document.getElementById('taxHealth').textContent = formatNumber(insurance.health * 12) + '원';
    document.getElementById('taxPension').textContent = formatNumber(insurance.pension * 12) + '원';
    document.getElementById('taxEmployment').textContent = formatNumber(insurance.employment * 12) + '원';
    document.getElementById('taxIndustrial').textContent = formatNumber(insurance.industrial * 12) + '원';
    
    const totalDeduction = tax.totalTax + insurance.total * 12;
    document.getElementById('taxTotal').textContent = formatNumber(totalDeduction) + '원';
    
    document.getElementById('taxResult').style.display = 'block';

    // 차트 그리기
    drawTaxChart(tax, insurance);
}

// 연봉 비교
function compareSalaries() {
    const salary1 = parseFloat(document.getElementById('compareSalary1').value);
    const salary2 = parseFloat(document.getElementById('compareSalary2').value);
    const familyCount = parseInt(document.getElementById('compareFamilyCount').value) || 1;

    if (!salary1 || salary1 <= 0 || !salary2 || salary2 <= 0) {
        alert('두 연봉을 모두 입력해주세요.');
        return;
    }

    const monthly1 = salary1 / 12;
    const monthly2 = salary2 / 12;
    
    const insurance1 = calculateInsurance(monthly1);
    const insurance2 = calculateInsurance(monthly2);
    
    const tax1 = calculateIncomeTax(salary1, familyCount);
    const tax2 = calculateIncomeTax(salary2, familyCount);
    
    const net1 = monthly1 - insurance1.total - (tax1.totalTax / 12);
    const net2 = monthly2 - insurance2.total - (tax2.totalTax / 12);
    
    const netAnnual1 = net1 * 12;
    const netAnnual2 = net2 * 12;

    document.getElementById('compare1Salary').textContent = formatNumber(salary1) + '원';
    document.getElementById('compare1Net').textContent = formatNumber(netAnnual1) + '원';
    document.getElementById('compare1Monthly').textContent = formatNumber(net1) + '원';
    
    document.getElementById('compare2Salary').textContent = formatNumber(salary2) + '원';
    document.getElementById('compare2Net').textContent = formatNumber(netAnnual2) + '원';
    document.getElementById('compare2Monthly').textContent = formatNumber(net2) + '원';
    
    const diff = salary2 - salary1;
    const netDiff = netAnnual2 - netAnnual1;
    
    document.getElementById('compareDiff').textContent = formatNumber(diff) + '원';
    document.getElementById('compareNetDiff').textContent = formatNumber(netDiff) + '원';
    
    document.getElementById('compareResult').style.display = 'block';

    // 차트 그리기
    drawCompareChart(salary1, salary2, netAnnual1, netAnnual2);
}

// 차트 그리기 함수들
function drawSalaryChart(monthlySalary, insurance, tax, netSalary) {
    const canvas = document.getElementById('salaryChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = 300;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    const total = monthlySalary;
    const insurancePercent = (insurance / total) * 100;
    const taxPercent = (tax / total) * 100;
    const netPercent = (netSalary / total) * 100;
    
    let currentAngle = -Math.PI / 2;
    
    // 배경 원
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#f0f0f0';
    ctx.fill();
    
    // 실수령액
    const netAngle = (netPercent / 100) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + netAngle);
    ctx.closePath();
    ctx.fillStyle = '#10b981';
    ctx.fill();
    currentAngle += netAngle;
    
    // 4대보험
    const insuranceAngle = (insurancePercent / 100) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + insuranceAngle);
    ctx.closePath();
    ctx.fillStyle = '#3b82f6';
    ctx.fill();
    currentAngle += insuranceAngle;
    
    // 세금
    const taxAngle = (taxPercent / 100) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + taxAngle);
    ctx.closePath();
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    
    // 범례
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.fillText('실수령액', 20, 30);
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('4대보험', 20, 50);
    ctx.fillStyle = '#ef4444';
    ctx.fillText('세금', 20, 70);
}

function drawTaxChart(tax, insurance) {
    const canvas = document.getElementById('taxChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = 300;
    
    const barWidth = (canvas.width - 100) / 7;
    const maxValue = Math.max(
        tax.incomeTax,
        tax.localTax,
        insurance.health * 12,
        insurance.pension * 12,
        insurance.employment * 12,
        insurance.industrial * 12
    );
    const scale = (canvas.height - 80) / maxValue;
    
    const items = [
        { label: '소득세', value: tax.incomeTax, color: '#ef4444' },
        { label: '지방세', value: tax.localTax, color: '#f59e0b' },
        { label: '건강보험', value: insurance.health * 12, color: '#3b82f6' },
        { label: '국민연금', value: insurance.pension * 12, color: '#8b5cf6' },
        { label: '고용보험', value: insurance.employment * 12, color: '#06b6d4' },
        { label: '산재보험', value: insurance.industrial * 12, color: '#14b8a6' }
    ];
    
    items.forEach((item, index) => {
        const x = 50 + index * barWidth;
        const barHeight = item.value * scale;
        const y = canvas.height - 60 - barHeight;
        
        ctx.fillStyle = item.color;
        ctx.fillRect(x, y, barWidth - 10, barHeight);
        
        ctx.fillStyle = '#1e293b';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(item.label, x + (barWidth - 10) / 2, canvas.height - 40);
        ctx.fillText(formatNumber(item.value), x + (barWidth - 10) / 2, y - 5);
    });
}

function drawCompareChart(salary1, salary2, net1, net2) {
    const canvas = document.getElementById('compareChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = 300;
    
    const barWidth = (canvas.width - 100) / 4;
    const maxValue = Math.max(salary1, salary2, net1, net2);
    const scale = (canvas.height - 80) / maxValue;
    
    const items = [
        { label: '연봉1', value: salary1, color: '#6366f1' },
        { label: '실수령1', value: net1, color: '#10b981' },
        { label: '연봉2', value: salary2, color: '#8b5cf6' },
        { label: '실수령2', value: net2, color: '#14b8a6' }
    ];
    
    items.forEach((item, index) => {
        const x = 50 + index * barWidth;
        const barHeight = item.value * scale;
        const y = canvas.height - 60 - barHeight;
        
        ctx.fillStyle = item.color;
        ctx.fillRect(x, y, barWidth - 10, barHeight);
        
        ctx.fillStyle = '#1e293b';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(item.label, x + (barWidth - 10) / 2, canvas.height - 40);
        ctx.fillText(formatNumber(item.value), x + (barWidth - 10) / 2, y - 5);
    });
}

// 저장 기능
function saveCalculation(type) {
    let data = {};
    
    switch(type) {
        case 'salary':
            data = {
                type: 'salary',
                annualSalary: document.getElementById('annualSalary').value,
                familyCount: document.getElementById('familyCount').value,
                hasInsurance: document.getElementById('hasInsurance').value,
                result: document.getElementById('netSalary').textContent,
                timestamp: new Date().toISOString()
            };
            break;
        case 'retirement':
            data = {
                type: 'retirement',
                monthlySalary: document.getElementById('retirementSalary').value,
                workYears: document.getElementById('workYears').value,
                result: document.getElementById('retirementAmount').textContent,
                timestamp: new Date().toISOString()
            };
            break;
        case 'annual':
            data = {
                type: 'annual',
                monthlySalary: document.getElementById('annualMonthlySalary').value,
                annualDays: document.getElementById('annualDays').value,
                result: document.getElementById('annualAmount').textContent,
                timestamp: new Date().toISOString()
            };
            break;
        case 'tax':
            data = {
                type: 'tax',
                annualSalary: document.getElementById('taxSalary').value,
                familyCount: document.getElementById('taxFamilyCount').value,
                result: document.getElementById('taxTotal').textContent,
                timestamp: new Date().toISOString()
            };
            break;
        case 'compare':
            data = {
                type: 'compare',
                salary1: document.getElementById('compareSalary1').value,
                salary2: document.getElementById('compareSalary2').value,
                familyCount: document.getElementById('compareFamilyCount').value,
                result: document.getElementById('compareNetDiff').textContent,
                timestamp: new Date().toISOString()
            };
            break;
    }
    
    const saved = JSON.parse(localStorage.getItem('salaryCalculations') || '[]');
    saved.push(data);
    localStorage.setItem('salaryCalculations', JSON.stringify(saved));
    
    alert('계산 결과가 저장되었습니다!');
    loadSavedCalculations();
}

// 저장된 계산 내역 불러오기
function loadSavedCalculations() {
    const saved = JSON.parse(localStorage.getItem('salaryCalculations') || '[]');
    const savedList = document.getElementById('savedList');
    
    if (saved.length === 0) {
        savedList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">저장된 계산 내역이 없습니다.</p>';
        return;
    }
    
    savedList.innerHTML = saved.slice(-10).reverse().map((item, index) => {
        const date = new Date(item.timestamp);
        const typeNames = {
            salary: '연봉 계산',
            retirement: '퇴직금 계산',
            annual: '연차수당 계산',
            tax: '세금 분석',
            compare: '연봉 비교'
        };
        
        return `
            <div class="saved-item">
                <div class="saved-item-header">
                    <span class="saved-item-title">${typeNames[item.type]}</span>
                    <button class="saved-item-delete" onclick="deleteSavedCalculation(${saved.length - 1 - index})">삭제</button>
                </div>
                <p style="margin-top: 0.5rem; color: var(--text-secondary); font-size: 0.9rem;">
                    결과: ${item.result}
                </p>
                <p style="margin-top: 0.25rem; color: var(--text-secondary); font-size: 0.85rem;">
                    ${date.toLocaleString('ko-KR')}
                </p>
            </div>
        `;
    }).join('');
}

// 저장된 계산 삭제
function deleteSavedCalculation(index) {
    const saved = JSON.parse(localStorage.getItem('salaryCalculations') || '[]');
    saved.splice(saved.length - 1 - index, 1);
    localStorage.setItem('salaryCalculations', JSON.stringify(saved));
    loadSavedCalculations();
}

// 공유 기능
function shareResult(type) {
    let text = '';
    
    switch(type) {
        case 'salary':
            text = `연봉 계산 결과\n실수령액: ${document.getElementById('netSalary').textContent}`;
            break;
        case 'retirement':
            text = `퇴직금 계산 결과\n퇴직금: ${document.getElementById('retirementAmount').textContent}`;
            break;
        case 'annual':
            text = `연차수당 계산 결과\n연차수당: ${document.getElementById('annualAmount').textContent}`;
            break;
        case 'tax':
            text = `세금 분석 결과\n총 공제액: ${document.getElementById('taxTotal').textContent}`;
            break;
        case 'compare':
            text = `연봉 비교 결과\n차이: ${document.getElementById('compareNetDiff').textContent}`;
            break;
    }
    
    if (navigator.share) {
        navigator.share({
            title: '연봉 계산 결과',
            text: text,
            url: window.location.href
        });
    } else {
        // 클립보드에 복사
        navigator.clipboard.writeText(text).then(() => {
            alert('결과가 클립보드에 복사되었습니다!');
        });
    }
}

