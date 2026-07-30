const moment = require('moment');

function SafeToSpend(loan, expenses, today) {
    if (!loan) {
        return {"message": "No Loan Set"}
    }
    const installments = loan.installments;
    let dropped = loan.balance; 
    const todayM = moment(today).startOf('day');
    let numOfInstallments = installments.length;
    let nextDrop = null;
    let totalExpense = 0;
    let available = 0; 
    let weeksDifference = null;
    const arrayOfExpenses = expenses;
    
    for (let i=0; i < numOfInstallments; i++){
        if (moment(installments[i].date).isSameOrBefore(todayM, 'day')){
            dropped = parseFloat(dropped) + parseFloat(installments[i].amount);
        } else if (nextDrop === null && moment(installments[i].date).isAfter(todayM, 'day')) {
            nextDrop = installments[i].date;
        }
    }
    
    arrayOfExpenses.forEach(expense => {
        totalExpense += parseFloat(expense.amount);
    });
    available = dropped - totalExpense;
    if (nextDrop !== null){
        weeksDifference = moment(nextDrop).startOf('weeks').diff(moment(today).startOf('weeks'), 'weeks');
    }

    // Spread available cash across the weeks until the next installment lands.
    // Include the current week, so a next-drop this week still divides by 1.
    const weeksOfRunway = (weeksDifference !== null ? weeksDifference : 0) + 1;
    const weeklySafeToSpend = available / weeksOfRunway;

    return { dropped, available, nextDrop, weeksDifference, weeklySafeToSpend }

}

module.exports = { SafeToSpend };