document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GLOBALS & DOM REFERENCES ---
    const body = document.body;
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const sidebar = document.getElementById('sidebar');
    const navMenu = document.getElementById('nav-menu');
    const toolSearch = document.getElementById('tool-search');

    // Helper functions
    const formatCurrency = (amount) => `$${parseFloat(amount).toFixed(2)}`;
    const roundTo = (num, decimals) => parseFloat(num.toFixed(decimals));

    // --- 2. THEME PERSISTENCE & TOGGLE ---
    const THEME_KEY = 'infinity_calc_theme';

    function initTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (savedTheme === 'light') {
            body.classList.add('light-theme');
        } else {
            body.classList.remove('light-theme');
        }
    }

    themeToggleBtn.addEventListener('click', () => {
        const isLight = body.classList.toggle('light-theme');
        localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');
        if (typeof lucide !== 'undefined') { lucide.createIcons(); }
    });

    // --- 3. SIDEBAR AND SCROLL NAVIGATION ---

    sidebarToggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Handle smooth scrolling on link click
    navMenu.addEventListener('click', (e) => {
        const link = e.target.closest('li a');
        if (link && link.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Scroll the body/main content smoothly to the element
                window.scrollTo({
                    top: targetElement.offsetTop - 70, 
                    behavior: 'smooth'
                });
            }
            // Close sidebar on mobile after navigation
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        }
    });
    
    // --- 4. SEARCH FILTERING (Filters sidebar links) ---

    toolSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const listItems = navMenu.querySelectorAll('li');

        listItems.forEach(li => {
            const toolName = li.textContent.toLowerCase();
            const visible = toolName.includes(query);
            li.style.display = visible ? '' : 'none';
        });

        // Hide/show category headers if they have no visible links
        navMenu.querySelectorAll('section').forEach(section => {
            const visibleItems = Array.from(section.querySelectorAll('li')).some(li => li.style.display !== 'none');
            section.style.display = visibleItems ? '' : 'none';
        });
    });
    
    // --- 5. Tool Highlighting (Highlight link on scroll) ---
    const toolSections = document.querySelectorAll('.tool-section');
    const toolLinks = navMenu.querySelectorAll('li a');
    
    function highlightLink() {
        let current = '';
        const scrollY = window.scrollY;
        const headerOffset = 80;

        toolSections.forEach(section => {
            if (section.offsetTop <= scrollY + headerOffset) {
                current = section.id;
            }
        });

        toolLinks.forEach(a => {
            a.classList.remove('active-link');
            if (a.getAttribute('href').substring(1) === current) {
                a.classList.add('active-link');
                
                // Ensure the active link is visible in the scrollable sidebar
                a.scrollIntoView({ behavior: 'auto', block: 'nearest' });
            }
        });
    }

    window.addEventListener('scroll', highlightLink);
    
    // --- 6. CORE TOOL LOGIC IMPLEMENTATIONS (All 28 Tools) ---

    // 6.1 Basic Calculator Logic
    function initBasicCalculator() {
        const display = document.getElementById('calc-display');
        const buttons = document.querySelectorAll('#basic_calculator .basic-buttons button');
        let currentInput = '0';
        let operator = null;
        let previousValue = null;
        let waitingForSecondOperand = false;

        const updateDisplay = () => { display.value = currentInput; };
        const performCalculation = (p, n, op) => {
            p = parseFloat(p); n = parseFloat(n);
            if (isNaN(p) || isNaN(n)) return n;
            switch (op) {
                case '+': return p + n;
                case '-': return p - n;
                case '*': return p * n;
                case '/': return p / n;
                case '%': return p * (n / 100);
                default: return n;
            }
        };

        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const value = button.dataset.value;
                if (!isNaN(parseFloat(value)) || value === '.') {
                    if (value === '.' && currentInput.includes('.')) return;
                    if (waitingForSecondOperand) { currentInput = value === '.' ? '0.' : value; waitingForSecondOperand = false; } 
                    else { currentInput = currentInput === '0' && value !== '.' ? value : currentInput + value; }
                } else if (value === 'C') { currentInput = '0'; operator = null; previousValue = null; waitingForSecondOperand = false; } 
                else if (value === 'B') { currentInput = currentInput.length === 1 || currentInput === '0' ? '0' : currentInput.slice(0, -1); } 
                else if (['+', '-', '*', '/', '%'].includes(value)) {
                    const inputValue = parseFloat(currentInput);
                    if (previousValue === null && !isNaN(inputValue)) { previousValue = inputValue; } 
                    else if (operator) { 
                        const result = performCalculation(previousValue, inputValue, operator);
                        currentInput = String(result); previousValue = result; 
                    }
                    waitingForSecondOperand = true; operator = value;
                } else if (value === '=') {
                    if (!operator || waitingForSecondOperand) return;
                    currentInput = String(performCalculation(previousValue, parseFloat(currentInput), operator));
                    operator = null; previousValue = null; waitingForSecondOperand = true;
                }
                updateDisplay();
            });
        });
    }

    // 6.2 Scientific Calculator Logic
    function initScientificCalculator() {
        const display = document.getElementById('sci-calc-display');
        const buttons = document.querySelectorAll('#scientific_calculator .sci-buttons button');
        let currentInput = '0';
        let operator = null;
        let previousValue = null;
        let waitingForSecondOperand = false;

        const updateDisplay = () => { display.value = currentInput; };
        
        const performScientific = (op, val) => {
            switch (op) {
                case 'sin': return Math.sin(val * Math.PI / 180); 
                case 'cos': return Math.cos(val * Math.PI / 180);
                case 'tan': return Math.tan(val * Math.PI / 180);
                case 'log': return Math.log10(val);
                case 'sqrt': return Math.sqrt(val);
                default: return val;
            }
        };

        const performBasic = (p, n, op) => {
            p = parseFloat(p); n = parseFloat(n);
            if (isNaN(p) || isNaN(n)) return n;
            switch (op) {
                case '+': return p + n;
                case '-': return p - n;
                case '*': return p * n;
                case '/': return p / n;
                case '^': return Math.pow(p, n);
                default: return n;
            }
        };

        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const value = button.dataset.value;
                
                if (!isNaN(parseFloat(value)) || value === '.') {
                    if (value === '.' && currentInput.includes('.')) return;
                    if (waitingForSecondOperand) { currentInput = value === '.' ? '0.' : value; waitingForSecondOperand = false; } 
                    else { currentInput = currentInput === '0' && value !== '.' ? value : currentInput + value; }
                } else if (value === 'pi') {
                    currentInput = Math.PI.toFixed(10);
                    waitingForSecondOperand = true;
                } else if (['sin', 'cos', 'tan', 'log', 'sqrt'].includes(value)) {
                    currentInput = roundTo(performScientific(value, parseFloat(currentInput)), 5).toString();
                    waitingForSecondOperand = true;
                } 
                else if (value === 'C') { currentInput = '0'; operator = null; previousValue = null; waitingForSecondOperand = false; } 
                else if (value === 'B') { currentInput = currentInput.length === 1 || currentInput === '0' ? '0' : currentInput.slice(0, -1); } 
                else if (['+', '-', '*', '/', '^'].includes(value)) {
                    const inputValue = parseFloat(currentInput);
                    if (previousValue === null && !isNaN(inputValue)) { previousValue = inputValue; } 
                    else if (operator) { 
                        const result = performBasic(previousValue, inputValue, operator);
                        currentInput = String(result); previousValue = result; 
                    }
                    waitingForSecondOperand = true; operator = value;
                } else if (value === '=') {
                    if (!operator || waitingForSecondOperand) return;
                    currentInput = String(performBasic(previousValue, parseFloat(currentInput), operator));
                    operator = null; previousValue = null; waitingForSecondOperand = true;
                }
                updateDisplay();
            });
        });
    }

    // 6.3 Date & Age Calculator Logic
    function initDateAgeCalculator() {
        const startInput = document.getElementById('date-start');
        const endInput = document.getElementById('date-end');
        const output = document.getElementById('date-age-output');

        endInput.value = new Date().toISOString().split('T')[0];

        const calculateDateAge = () => {
            const startDate = new Date(startInput.value);
            const endDate = new Date(endInput.value);

            if (isNaN(startDate) || isNaN(endDate)) { output.textContent = 'Invalid Dates'; return; }

            const diffTime = Math.abs(endDate - startDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            const years = Math.floor(diffDays / 365.25);
            const remainingDays = Math.floor(diffDays % 365.25);

            output.textContent = `${years} Years, ${remainingDays} Days`;
        };
        [startInput, endInput].forEach(input => input.addEventListener('change', calculateDateAge));
        calculateDateAge();
    }
    
    // 6.4 Time Zone Converter Logic
    function initTimeZoneConverter() {
        const timeA = document.getElementById('tz-offset-a');
        const timeB = document.getElementById('tz-offset-b');
        const timeOutput = document.getElementById('tz-output-value');
        const diffOutput = document.getElementById('tz-diff-output');

        const calculateTimezone = () => {
            const offsetA = parseFloat(timeA.value);
            const offsetB = parseFloat(timeB.value);
            const offsetDiff = offsetB - offsetA;
            
            const baseHour = 10.0;
            let resultHour = baseHour + offsetDiff;

            if (resultHour >= 24) { resultHour -= 24; } 
            else if (resultHour < 0) { resultHour += 24; }
            
            const hours = Math.floor(resultHour);
            const minutes = Math.round((resultHour - hours) * 60);

            const ampm = hours >= 12 && hours < 24 ? 'PM' : 'AM';
            const displayHours = hours % 12 === 0 ? 12 : hours % 12;
            const displayMinutes = minutes < 10 ? '0' + minutes : minutes;

            timeOutput.textContent = `${displayHours}:${displayMinutes} ${ampm}`;
            diffOutput.textContent = `${offsetDiff > 0 ? '+' : ''}${roundTo(offsetDiff, 1)}`;
        };

        [timeA, timeB].forEach(input => input.addEventListener('change', calculateTimezone));
        calculateTimezone();
    }

    // 6.5 Unit Converter (Length)
    function initUnitConverter() {
        const inputValue = document.getElementById('unit-input-value');
        const inputUnit = document.getElementById('unit-input-unit');
        const outputUnit = document.getElementById('unit-output-unit');
        const outputValue = document.getElementById('unit-output-value');
        const swapBtn = document.getElementById('unit-swap-btn');
        const FT_TO_M = 0.3048;

        const convertLength = () => {
            const value = parseFloat(inputValue.value);
            const fromUnit = inputUnit.value;
            const toUnit = outputUnit.value;

            if (isNaN(value)) { outputValue.textContent = '0.00'; return; }
            
            let result = value;
            if (fromUnit === 'M' && toUnit === 'FT') { result = value / FT_TO_M; } 
            else if (fromUnit === 'FT' && toUnit === 'M') { result = value * FT_TO_M; } 
            outputValue.textContent = result.toFixed(3);
        };

        const swapUnits = () => {
            const tempFrom = inputUnit.value;
            const tempTo = outputUnit.value;
            inputUnit.value = tempTo;
            outputUnit.value = tempFrom;
            convertLength();
        };

        inputUnit.addEventListener('change', () => {
            outputUnit.value = inputUnit.value === 'M' ? 'FT' : 'M';
            convertLength();
        });

        [inputValue, inputUnit].forEach(input => input.addEventListener('input', convertLength));
        swapBtn.addEventListener('click', swapUnits);
        convertLength();
    }
    
    // 6.6 Currency Converter (Static Rate)
    function initCurrencyConverter() {
        const inputValue = document.getElementById('curr-input-value');
        const inputUnit = document.getElementById('curr-input-unit');
        const outputUnit = document.getElementById('curr-output-unit');
        const outputValue = document.getElementById('curr-output-value');
        const swapBtn = document.getElementById('curr-swap-btn');
        const USD_TO_EUR = 0.92;

        const convertCurrency = () => {
            const value = parseFloat(inputValue.value);
            const fromUnit = inputUnit.value;
            const toUnit = outputUnit.value;

            if (isNaN(value) || value < 0) { outputValue.textContent = '0.00'; return; }

            let result = value;
            if (fromUnit === 'USD' && toUnit === 'EUR') { result = value * USD_TO_EUR; } 
            else if (fromUnit === 'EUR' && toUnit === 'USD') { result = value / USD_TO_EUR; }
            outputValue.textContent = result.toFixed(2);
        };
        
        const swapUnits = () => {
            const tempFrom = inputUnit.value;
            const tempTo = outputUnit.value;
            inputUnit.value = tempTo;
            outputUnit.value = tempFrom;
            convertCurrency();
        };

        inputUnit.addEventListener('change', () => {
            outputUnit.value = inputUnit.value === 'USD' ? 'EUR' : 'USD';
            convertCurrency();
        });

        [inputValue, inputUnit].forEach(input => input.addEventListener('input', convertCurrency));
        swapBtn.addEventListener('click', swapUnits);
        convertCurrency();
    }

    // 6.7 Percentage Calculator Logic
    function initPercentageCalculator() {
        const partA = document.getElementById('perc-part-a');
        const totalB = document.getElementById('perc-total-b');
        const outputValue = document.getElementById('perc-output-value');

        const calculatePercentage = () => {
            const a = parseFloat(partA.value);
            const b = parseFloat(totalB.value);

            if (isNaN(a) || isNaN(b) || b === 0) { outputValue.textContent = '0.00%'; return; }

            const percentage = (a / b) * 100;
            outputValue.textContent = `${percentage.toFixed(2)}%`;
        };

        [partA, totalB].forEach(input => input.addEventListener('input', calculatePercentage));
        calculatePercentage();
    }

    // 6.8 Random Number Generator Logic
    function initRandomNumberGenerator() {
        const minInput = document.getElementById('rand-min');
        const maxInput = document.getElementById('rand-max');
        const generateBtn = document.getElementById('generate-random');
        const outputValue = document.getElementById('rand-output-value');

        const generateRandom = () => {
            const min = parseInt(minInput.value);
            const max = parseInt(maxInput.value);

            if (isNaN(min) || isNaN(max) || min > max) { outputValue.textContent = 'Error'; return; }

            const result = Math.floor(Math.random() * (max - min + 1)) + min;
            outputValue.textContent = result;
        };

        generateBtn.addEventListener('click', generateRandom);
        [minInput, maxInput].forEach(input => input.addEventListener('input', () => outputValue.textContent = '--'));
    }

    // 6.9 Loan Calculator Logic
    function initLoanCalculator() {
        const amountInput = document.getElementById('loan-amount');
        const rateInput = document.getElementById('loan-rate');
        const yearsInput = document.getElementById('loan-years');
        const monthlyPaymentSpan = document.getElementById('loan-monthly-payment');
        const totalInterestSpan = document.getElementById('loan-total-interest');

        const calculateLoan = () => {
            const P = parseFloat(amountInput.value);
            const annualRate = parseFloat(rateInput.value) / 100;
            const termYears = parseFloat(yearsInput.value);

            if (isNaN(P) || isNaN(annualRate) || isNaN(termYears) || P <= 0 || termYears <= 0) {
                monthlyPaymentSpan.textContent = '$0.00';
                totalInterestSpan.textContent = 'Total Interest: $0.00';
                return;
            }

            const i = annualRate / 12; 
            const n = termYears * 12; 
            let monthlyPayment;

            if (i === 0) {
                monthlyPayment = P / n;
            } else {
                monthlyPayment = P * (i * Math.pow((1 + i), n)) / (Math.pow((1 + i), n) - 1);
            }

            const totalPayment = monthlyPayment * n;
            const totalInterest = totalPayment - P;

            monthlyPaymentSpan.textContent = formatCurrency(monthlyPayment);
            totalInterestSpan.textContent = `Total Interest: ${formatCurrency(totalInterest)}`;
        };

        [amountInput, rateInput, yearsInput].forEach(input => 
            input.addEventListener('input', calculateLoan)
        );
        calculateLoan();
    }
    
    // 6.10 Mortgage Calculator Logic
    function initMortgageCalculator() {
        const priceInput = document.getElementById('mortgage-price');
        const downInput = document.getElementById('mortgage-down');
        const rateInput = document.getElementById('mortgage-rate');
        const yearsInput = document.getElementById('mortgage-years');
        const principalOutput = document.getElementById('mortgage-principal-output');
        const monthlyOutput = document.getElementById('mortgage-monthly-output');

        const calculateMortgage = () => {
            const price = parseFloat(priceInput.value) || 0;
            const down = parseFloat(downInput.value) || 0;
            const annualRate = parseFloat(rateInput.value) / 100;
            const termYears = parseFloat(yearsInput.value);
            
            const P = price - down;

            if (isNaN(annualRate) || isNaN(termYears) || P <= 0 || termYears <= 0) {
                principalOutput.textContent = formatCurrency(P < 0 ? 0 : P);
                monthlyOutput.textContent = `Monthly Payment: $0.00`;
                return;
            }

            const i = annualRate / 12;
            const n = termYears * 12;
            let monthlyPayment;

            if (i === 0) {
                monthlyPayment = P / n;
            } else {
                monthlyPayment = P * (i * Math.pow((1 + i), n)) / (Math.pow((1 + i), n) - 1);
            }
            
            principalOutput.textContent = formatCurrency(P);
            monthlyOutput.textContent = `Monthly Payment: ${formatCurrency(monthlyPayment)}`;
        };
        
        [priceInput, downInput, rateInput, yearsInput].forEach(input => input.addEventListener('input', calculateMortgage));
        calculateMortgage();
    }

    // 6.11 Compound Interest Calculator Logic
    function initCompoundInterestCalculator() {
        const principalInput = document.getElementById('ci-principal');
        const rateInput = document.getElementById('ci-rate');
        const yearsInput = document.getElementById('ci-years');
        const nSelect = document.getElementById('ci-n');
        const futureValueSpan = document.getElementById('ci-future-value');

        const calculateCI = () => {
            const P = parseFloat(principalInput.value);
            const r = parseFloat(rateInput.value) / 100;
            const t = parseFloat(yearsInput.value);
            const n = parseFloat(nSelect.value);

            if (isNaN(P) || isNaN(r) || isNaN(t) || P <= 0 || t <= 0) {
                futureValueSpan.textContent = '$0.00';
                return;
            }

            const futureValue = P * Math.pow((1 + r / n), (n * t));
            futureValueSpan.textContent = formatCurrency(futureValue);
        };

        [principalInput, rateInput, yearsInput, nSelect].forEach(input => 
            input.addEventListener('input', calculateCI)
        );
        calculateCI();
    }
    
    // 6.12 Tax Calculator
    function initTaxCalculator() {
        const priceInput = document.getElementById('tax-price');
        const rateInput = document.getElementById('tax-rate');
        const amountOutput = document.getElementById('tax-amount-output');
        const totalOutput = document.getElementById('tax-total-output');

        const calculateTax = () => {
            const price = parseFloat(priceInput.value);
            const rate = parseFloat(rateInput.value);

            if (isNaN(price) || isNaN(rate) || price < 0 || rate < 0) {
                amountOutput.textContent = '$0.00';
                totalOutput.textContent = 'Total: $0.00';
                return;
            }
            const taxAmount = price * (rate / 100);
            const totalPrice = price + taxAmount;

            amountOutput.textContent = formatCurrency(taxAmount);
            totalOutput.textContent = `Total: ${formatCurrency(totalPrice)}`;
        };
        [priceInput, rateInput].forEach(input => input.addEventListener('input', calculateTax));
        calculateTax();
    }

    // 6.13 Discount & Markup Calculator
    function initDiscountMarkupCalculator() {
        const priceInput = document.getElementById('dm-price');
        const percentInput = document.getElementById('dm-percent');
        const typeSelect = document.getElementById('dm-type');
        const finalOutput = document.getElementById('dm-final-output');
        const savedOutput = document.getElementById('dm-saved-output');

        const calculateDM = () => {
            const price = parseFloat(priceInput.value);
            const percent = parseFloat(percentInput.value);
            const type = typeSelect.value;

            if (isNaN(price) || isNaN(percent) || price < 0) {
                finalOutput.textContent = '$0.00';
                savedOutput.textContent = 'Saved/Added: $0.00';
                return;
            }

            const adjustment = price * (percent / 100);
            let finalPrice;
            let label;
            
            if (type === 'discount') {
                finalPrice = price - adjustment;
                label = `Saved: ${formatCurrency(adjustment)}`;
            } else { // markup
                finalPrice = price + adjustment;
                label = `Added: ${formatCurrency(adjustment)}`;
            }

            finalOutput.textContent = formatCurrency(finalPrice);
            savedOutput.textContent = label;
        };
        [priceInput, percentInput, typeSelect].forEach(input => input.addEventListener('input', calculateDM));
        calculateDM();
    }

    // 6.14 Salary Calculator (Conversion)
    function initSalaryCalculator() {
        const annualInput = document.getElementById('salary-annual');
        const freqSelect = document.getElementById('salary-frequency');
        const output = document.getElementById('salary-output');

        const calculateSalary = () => {
            const annual = parseFloat(annualInput.value);
            const frequency = freqSelect.value;
            if (isNaN(annual) || annual < 0) { output.textContent = '$0.00'; return; }
            
            let result;
            switch (frequency) {
                case 'monthly': result = annual / 12; break;
                case 'weekly': result = annual / 52; break;
                case 'daily': result = annual / 260; break;
                default: result = 0;
            }
            output.textContent = formatCurrency(result);
        };
        [annualInput, freqSelect].forEach(input => input.addEventListener('input', calculateSalary));
        calculateSalary();
    }

    // 6.15 Tip Calculator
    function initTipCalculator() {
        const billInput = document.getElementById('tip-bill');
        const percentInput = document.getElementById('tip-percent');
        const splitInput = document.getElementById('tip-split');
        const tipOutput = document.getElementById('tip-amount-output');
        const perPersonOutput = document.getElementById('tip-per-person');

        const calculateTip = () => {
            const bill = parseFloat(billInput.value);
            const percent = parseFloat(percentInput.value);
            const split = parseInt(splitInput.value);

            if (isNaN(bill) || isNaN(percent) || isNaN(split) || bill < 0 || percent < 0 || split < 1) {
                tipOutput.textContent = '$0.00';
                perPersonOutput.textContent = 'Total Per Person: $0.00';
                return;
            }

            const tipAmount = bill * (percent / 100);
            const totalBill = bill + tipAmount;
            const perPerson = totalBill / split;

            tipOutput.textContent = formatCurrency(tipAmount);
            perPersonOutput.textContent = `Total Per Person: ${formatCurrency(perPerson)}`;
        };
        [billInput, percentInput, splitInput].forEach(input => input.addEventListener('input', calculateTip));
        calculateTip();
    }
    
    // 6.16 Depreciation Calculator
    function initDepreciationCalculator() {
        const costInput = document.getElementById('dep-cost');
        const salvageInput = document.getElementById('dep-salvage');
        const yearsInput = document.getElementById('dep-years');
        const output = document.getElementById('dep-output');

        const calculateDepreciation = () => {
            const cost = parseFloat(costInput.value);
            const salvage = parseFloat(salvageInput.value);
            const years = parseFloat(yearsInput.value);

            if (isNaN(cost) || isNaN(salvage) || isNaN(years) || cost < 0 || salvage < 0 || years <= 0) {
                output.textContent = '$0.00';
                return;
            }
            
            const annualDepreciation = (cost - salvage) / years;
            output.textContent = formatCurrency(annualDepreciation);
        };
        [costInput, salvageInput, yearsInput].forEach(input => input.addEventListener('input', calculateDepreciation));
        calculateDepreciation();
    }

    // 6.17 Revenue / Profit Calculator
    function initRevenueProfitCalculator() {
        const revenueInput = document.getElementById('rp-revenue');
        const costInput = document.getElementById('rp-cost');
        const profitOutput = document.getElementById('rp-profit-output');
        const marginOutput = document.getElementById('rp-margin-output');

        const calculateProfit = () => {
            const revenue = parseFloat(revenueInput.value);
            const cost = parseFloat(costInput.value);

            if (isNaN(revenue) || isNaN(cost) || revenue < 0 || cost < 0) {
                profitOutput.textContent = '$0.00';
                marginOutput.textContent = 'Profit Margin: 0.00%';
                return;
            }

            const profit = revenue - cost;
            const margin = revenue === 0 ? 0 : (profit / revenue) * 100;
            
            profitOutput.textContent = formatCurrency(profit);
            marginOutput.textContent = `Profit Margin: ${margin.toFixed(2)}%`;
        };
        [revenueInput, costInput].forEach(input => input.addEventListener('input', calculateProfit));
        calculateProfit();
    }

    // 6.18 Savings & Investment Calculator
    function initSavingsInvestmentCalculator() {
        const goalInput = document.getElementById('sav-goal');
        const contributionInput = document.getElementById('sav-contribution');
        const output = document.getElementById('sav-output');

        const calculateSavings = () => {
            const goal = parseFloat(goalInput.value);
            const contribution = parseFloat(contributionInput.value);

            if (isNaN(goal) || isNaN(contribution) || goal <= 0 || contribution <= 0) {
                output.textContent = '0 Months';
                return;
            }
            
            const months = goal / contribution;
            output.textContent = `${Math.ceil(months)} Months`;
        };
        [goalInput, contributionInput].forEach(input => input.addEventListener('input', calculateSavings));
        calculateSavings();
    }
    
    // 6.19 BMI Calculator Logic
    function initBMICalculator() {
        const weightInput = document.getElementById('bmi-weight');
        const heightInput = document.getElementById('bmi-height');
        const bmiValueSpan = document.getElementById('bmi-value');
        const bmiStatusSpan = document.getElementById('bmi-status');

        const calculateBMI = () => {
            const weight = parseFloat(weightInput.value);
            const heightCm = parseFloat(heightInput.value);

            if (isNaN(weight) || isNaN(heightCm) || weight <= 0 || heightCm <= 0) {
                bmiValueSpan.textContent = '--';
                bmiStatusSpan.textContent = 'Enter values to see status';
                bmiStatusSpan.style.color = 'inherit';
                return;
            }

            const heightM = heightCm / 100;
            const bmi = weight / (heightM * heightM);
            const roundedBMI = bmi.toFixed(2);

            let status = '';
            let color = '';

            if (bmi < 18.5) { status = 'Underweight'; color = '#fcd34d'; } 
            else if (bmi < 25) { status = 'Normal weight'; color = '#4ade80'; } 
            else if (bmi < 30) { status = 'Overweight'; color = '#fb923c'; } 
            else { status = 'Obesity'; color = '#f87171'; }

            bmiValueSpan.textContent = roundedBMI;
            bmiStatusSpan.textContent = status;
            bmiStatusSpan.style.color = color;
        };

        document.getElementById('calculate-bmi').addEventListener('click', calculateBMI);
        [weightInput, heightInput].forEach(input => input.addEventListener('input', calculateBMI));
        calculateBMI();
    }

    // 6.20 Calorie Calculator (BMR) Logic
    function initCalorieCalculator() {
        const genderSelect = document.getElementById('cal-gender');
        const ageInput = document.getElementById('cal-age');
        const weightInput = document.getElementById('cal-weight');
        const heightInput = document.getElementById('cal-height');
        const outputValue = document.getElementById('cal-output-value');

        const calculateBMR = () => {
            const gender = genderSelect.value;
            const age = parseFloat(ageInput.value);
            const weight = parseFloat(weightInput.value);
            const height = parseFloat(heightInput.value);

            if (isNaN(age) || isNaN(weight) || isNaN(height) || age <= 0 || weight <= 0 || height <= 0) {
                outputValue.textContent = '--';
                return;
            }

            let bmr = 0;
            if (gender === 'male') {
                bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
            } else { // female
                bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
            }

            outputValue.textContent = bmr.toFixed(0);
        };

        [genderSelect, ageInput, weightInput, heightInput].forEach(input => 
            input.addEventListener('input', calculateBMR)
        );
        calculateBMR();
    }
    
    // 6.21 Temperature Converter Logic
    function initTempConverter() {
        const inputValue = document.getElementById('temp-input-value');
        const inputUnit = document.getElementById('temp-input-unit');
        const outputUnit = document.getElementById('temp-output-unit');
        const outputValue = document.getElementById('temp-output-value');
        const swapBtn = document.getElementById('temp-swap-btn');

        const convertTemperature = () => {
            const value = parseFloat(inputValue.value);
            const fromUnit = inputUnit.value;
            const toUnit = outputUnit.value;

            if (isNaN(value)) { outputValue.textContent = '0.00'; return; }

            let result = value;

            if (fromUnit === 'C' && toUnit === 'F') { result = (value * 9/5) + 32; } 
            else if (fromUnit === 'F' && toUnit === 'C') { result = (value - 32) * 5/9; }

            outputValue.textContent = result.toFixed(2);
        };

        const swapUnits = () => {
            const tempFrom = inputUnit.value;
            const tempTo = outputUnit.value;
            inputUnit.value = tempTo;
            outputUnit.value = tempFrom;
            convertTemperature();
        };
        
        inputUnit.addEventListener('change', () => {
            outputUnit.value = inputUnit.value === 'C' ? 'F' : 'C';
            convertTemperature();
        });

        [inputValue, inputUnit].forEach(input => input.addEventListener('input', convertTemperature));
        swapBtn.addEventListener('click', swapUnits);
        convertTemperature();
    }

    // 6.22 Energy Converter (Joule/Calorie)
    function initEnergyConverter() {
        const inputValue = document.getElementById('energy-input-value');
        const inputUnit = document.getElementById('energy-input-unit');
        const outputUnit = document.getElementById('energy-output-unit');
        const outputValue = document.getElementById('energy-output-value');
        const swapBtn = document.getElementById('energy-swap-btn');
        const JOULE_TO_CALORIE = 0.239006;

        const convertEnergy = () => {
            const value = parseFloat(inputValue.value);
            const fromUnit = inputUnit.value;
            const toUnit = outputUnit.value;

            if (isNaN(value)) { outputValue.textContent = '0.00'; return; }
            
            let result = value;
            if (fromUnit === 'JOULE' && toUnit === 'CALORIE') {
                result = value * JOULE_TO_CALORIE;
            } else if (fromUnit === 'CALORIE' && toUnit === 'JOULE') {
                result = value / JOULE_TO_CALORIE;
            }
            outputValue.textContent = result.toFixed(3);
        };

        const swapUnits = () => {
            const tempFrom = inputUnit.value;
            const tempTo = outputUnit.value;
            inputUnit.value = tempTo;
            outputUnit.value = tempFrom;
            convertEnergy();
        };

        [inputValue, inputUnit].forEach(input => input.addEventListener('input', convertEnergy));
        inputUnit.addEventListener('change', () => {
            outputUnit.value = inputUnit.value === 'JOULE' ? 'CALORIE' : 'JOULE';
            convertEnergy();
        });
        swapBtn.addEventListener('click', swapUnits);
        convertEnergy();
    }

    // 6.23 Pressure Converter (PSI/Bar)
    function initPressureConverter() {
        const inputValue = document.getElementById('pressure-input-value');
        const inputUnit = document.getElementById('pressure-input-unit');
        const outputUnit = document.getElementById('pressure-output-unit');
        const outputValue = document.getElementById('pressure-output-value');
        const swapBtn = document.getElementById('pressure-swap-btn');
        const PSI_TO_BAR = 0.0689476;

        const convertPressure = () => {
            const value = parseFloat(inputValue.value);
            const fromUnit = inputUnit.value;
            const toUnit = outputUnit.value;

            if (isNaN(value)) { outputValue.textContent = '0.00'; return; }
            
            let result = value;
            if (fromUnit === 'PSI' && toUnit === 'BAR') {
                result = value * PSI_TO_BAR;
            } else if (fromUnit === 'BAR' && toUnit === 'PSI') {
                result = value / PSI_TO_BAR;
            }
            outputValue.textContent = result.toFixed(3);
        };

        const swapUnits = () => {
            const tempFrom = inputUnit.value;
            const tempTo = outputUnit.value;
            inputUnit.value = tempTo;
            outputUnit.value = tempFrom;
            convertPressure();
        };

        [inputValue, inputUnit].forEach(input => input.addEventListener('input', convertPressure));
        inputUnit.addEventListener('change', () => {
            outputUnit.value = inputUnit.value === 'PSI' ? 'BAR' : 'PSI';
            convertPressure();
        });
        swapBtn.addEventListener('click', swapUnits);
        convertPressure();
    }

    // 6.24 Speed Converter (km/h / mph)
    function initSpeedConverter() {
        const inputValue = document.getElementById('speed-input-value');
        const inputUnit = document.getElementById('speed-input-unit');
        const outputUnit = document.getElementById('speed-output-unit');
        const outputValue = document.getElementById('speed-output-value');
        const swapBtn = document.getElementById('speed-swap-btn');
        const KMH_TO_MPH = 0.621371;

        const convertSpeed = () => {
            const value = parseFloat(inputValue.value);
            const fromUnit = inputUnit.value;
            const toUnit = outputUnit.value;

            if (isNaN(value)) { outputValue.textContent = '0.00'; return; }
            
            let result = value;
            if (fromUnit === 'KMH' && toUnit === 'MPH') {
                result = value * KMH_TO_MPH;
            } else if (fromUnit === 'MPH' && toUnit === 'KMH') {
                result = value / KMH_TO_MPH;
            }
            outputValue.textContent = result.toFixed(2);
        };

        const swapUnits = () => {
            const tempFrom = inputUnit.value;
            const tempTo = outputUnit.value;
            inputUnit.value = tempTo;
            outputUnit.value = tempFrom;
            convertSpeed();
        };

        [inputValue, inputUnit].forEach(input => input.addEventListener('input', convertSpeed));
        inputUnit.addEventListener('change', () => {
            outputUnit.value = inputUnit.value === 'KMH' ? 'MPH' : 'KMH';
            convertSpeed();
        });
        swapBtn.addEventListener('click', swapUnits);
        convertSpeed();
    }

    // 6.25 Age on Other Planets Calculator Logic
    function initPlanetaryAgeCalculator() {
        const earthAgeInput = document.getElementById('planet-age-earth');
        const planetSelect = document.getElementById('planet-select');
        const outputValue = document.getElementById('planet-output-value');

        const calculatePlanetaryAge = () => {
            const earthAge = parseFloat(earthAgeInput.value);
            const orbitalPeriod = parseFloat(planetSelect.value);

            if (isNaN(earthAge) || earthAge < 0) { outputValue.textContent = '--'; return; }

            const planetaryAge = earthAge / orbitalPeriod;
            outputValue.textContent = planetaryAge.toFixed(2);
        };

        [earthAgeInput, planetSelect].forEach(input => input.addEventListener('input', calculatePlanetaryAge));
        calculatePlanetaryAge();
    }

    // 6.26 Data Storage Converter Logic
    function initDataStorageConverter() {
        const inputValue = document.getElementById('data-input-value');
        const inputUnit = document.getElementById('data-input-unit');
        const outputUnit = document.getElementById('data-output-unit');
        const outputValue = document.getElementById('data-output-value');
        const swapBtn = document.getElementById('data-swap-btn');

        const factors = {
            'KB': 1 / 1024,
            'MB': 1,
            'GB': 1024,
            'TB': 1024 * 1024
        };

        const convertDataStorage = () => {
            const value = parseFloat(inputValue.value);
            const fromUnit = inputUnit.value;
            const toUnit = outputUnit.value;

            if (isNaN(value)) { outputValue.textContent = '0.00'; return; }

            const valueInBase = value * factors[fromUnit];
            const result = valueInBase / factors[toUnit];

            outputValue.textContent = result.toFixed(3);
        };

        const swapUnits = () => {
            const tempFrom = inputUnit.value;
            const tempTo = outputUnit.value;
            inputUnit.value = tempTo;
            outputUnit.value = tempFrom;
            convertDataStorage();
        };

        [inputValue, inputUnit, outputUnit].forEach(input => input.addEventListener('input', convertDataStorage));
        swapBtn.addEventListener('click', swapUnits);
        convertDataStorage();
    }

    // 6.27 File Size Estimator
    function initFileSizeEstimator() {
        const sizeInput = document.getElementById('fse-file-size');
        const countInput = document.getElementById('fse-file-count');
        const output = document.getElementById('fse-output-value');

        const estimateSize = () => {
            const size = parseFloat(sizeInput.value); 
            const count = parseInt(countInput.value);

            if (isNaN(size) || isNaN(count) || size < 0 || count < 0) {
                output.textContent = '0.00 MB';
                return;
            }

            const totalMB = size * count;
            let displayValue;
            let displayUnit;

            if (totalMB >= 1024) {
                displayValue = totalMB / 1024;
                displayUnit = 'GB';
            } else {
                displayValue = totalMB;
                displayUnit = 'MB';
            }

            output.textContent = `${displayValue.toFixed(2)} ${displayUnit}`;
        };
        [sizeInput, countInput].forEach(input => input.addEventListener('input', estimateSize));
        estimateSize();
    }

    // 6.28 Time Duration Converter
    function initTimeDurationConverter() {
        const daysInput = document.getElementById('td-days');
        const hoursInput = document.getElementById('td-hours');
        const minutesInput = document.getElementById('td-minutes');
        const output = document.getElementById('td-output-value');
        
        const convertTimeDuration = () => {
            const days = parseInt(daysInput.value) || 0;
            const hours = parseInt(hoursInput.value) || 0;
            const minutes = parseInt(minutesInput.value) || 0;

            const totalSeconds = (days * 86400) + (hours * 3600) + (minutes * 60);
            output.textContent = totalSeconds.toLocaleString();
        };

        [daysInput, hoursInput, minutesInput].forEach(input => input.addEventListener('input', convertTimeDuration));
        convertTimeDuration();
    }


    // --- 7. INITIALIZATION ---

    function initializeApp() {
        initTheme();
        
        // --- INITIALIZE ALL TOOLS ---
        initBasicCalculator();
        initScientificCalculator(); 
        initDateAgeCalculator();
        initTimeZoneConverter();
        initUnitConverter();
        initCurrencyConverter();
        initPercentageCalculator();
        initRandomNumberGenerator();
        
        initLoanCalculator();
        initMortgageCalculator();
        initCompoundInterestCalculator();
        initTaxCalculator();
        initDiscountMarkupCalculator();
        initSalaryCalculator();
        initTipCalculator();
        initDepreciationCalculator();
        initRevenueProfitCalculator();
        initSavingsInvestmentCalculator();
        
        initBMICalculator();
        initCalorieCalculator();
        
        initTempConverter();
        initEnergyConverter();
        initPressureConverter();
        initSpeedConverter();
        initPlanetaryAgeCalculator();
        
        initDataStorageConverter();
        initFileSizeEstimator();
        initTimeDurationConverter();

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Initial scroll highlight
        highlightLink();
    }

    initializeApp();
});
