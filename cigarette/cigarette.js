var count = document.querySelector('.container:nth-child(1');
var bene = document.querySelector('.container:nth-child(2)');
var initial = new Date(2020, 5, 13, 14, 04, 0);

let labels = ['jours', 'heures', 'min', 'sec'];

let numbers = (tar, list) => {
    let ol = document.createElement("ol");
    ol.id = 'countdown';
    let lis = list.reduce((acc, cur, i, arr) => {
        let li = document.createElement('li');
        li.className = 'number';
        let digits = ol.appendChild(document.createElement('span'));
        digits.className = 'number-digit';
        let unit = ol.appendChild(document.createElement('span'));
        unit.className = 'number-unit';
        unit.innerText = cur;
        li.appendChild(digits);
        li.appendChild(unit);
        acc.push(li);
        ol.appendChild(li);
        return acc;
    }, []);
    tar.appendChild(ol);
    return lis;
}

let links = ['src/time.svg', 'src/euro.svg', 'src/cigarette.svg'];

let benefits = (tar, list) => {
    const PREFIX = '×';
    let ol = document.createElement("ol");
    ol.id = 'benefits';
    let lis = list.reduce((acc, cur, i, arr) => {
        let li = document.createElement('li');
        li.className = 'benefit';
        let digits = ol.appendChild(document.createElement('span'));
        digits.className = 'benefit-digit';
        let sign = ol.appendChild(document.createElement('span'));
        sign.className = 'benefit-sign';
        sign.innerText = PREFIX;
        let logo = ol.appendChild(document.createElement('span'));
        logo.className = 'benefit-logo';
        let img = document.createElement('img');
        img.src = cur;
        img.alt = 'logo';
        logo.appendChild(img);
        li.appendChild(digits)
        li.appendChild(sign)
        li.appendChild(logo);
        acc.push(li);
        ol.appendChild(li);
        return acc;
    }, []);
    tar.appendChild(ol);
    return lis;
}

var clis = numbers(count, labels);
var blis = benefits(bene, links);

var recurrent = (count_lis, benefits_lis, initial) => {
    let diff = Date.now() - initial;
    let millis = 24 * 60 * 60 * 1000;
    const DAYS = ~~(diff / millis);
    diff -= DAYS * millis;
    const HOURS = ~~(diff / (millis /= 24));
    diff -= HOURS * millis;
    const MINUTES = ~~(diff / (millis /= 60));
    diff -= MINUTES * millis;
    const SECONDS = ~~(diff / (millis /= 60));

    let durations = [DAYS, HOURS, MINUTES, SECONDS];

    let refreshDurations = (target, durations) => {
        target.forEach((elt, i, arr) => {
            elt.firstChild.innerText = durations[i];
        });
    }
    
    const CIGARETTES_A_DAY = 20;
    const CIGARETTES_PER_HOUR = 20 / 24;
    const HOURS_PER_CIGARETTE = .5;
    const EURO_PER_CIGARETTE = .475;
    diff = Date.now() - initial;
    const CIGARETTES = ~~(diff/(60 * 60 * 1000) * CIGARETTES_PER_HOUR);
    const HOURS_GAINED = ~~(CIGARETTES * HOURS_PER_CIGARETTE / 2);
    const EUROS_GAINED = ~~(CIGARETTES * EURO_PER_CIGARETTE);

    let benefits = [HOURS_GAINED, EUROS_GAINED, CIGARETTES];
    
    let refreshBenefits = (target, benefits) => {
        target.forEach((elt, i, arr) => {
            elt.firstChild.innerText = benefits[i];
        });
    }

    refreshDurations(clis, durations);

    refreshBenefits(blis, benefits);

    setTimeout(recurrent, 100, count_lis, benefits_lis, initial);
}

setTimeout(recurrent, 100, clis, null, initial);
