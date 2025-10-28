function convert() {
    let value = parseFloat(document.getElementById('inputValue').value);
    let from = document.getElementById('inputUnit').value;
    let to = document.getElementById('outputUnit').value;

    if(isNaN(value)) {
        alert('Please enter a valid number!');
        return;
    }

    let meters = value; // convert all to meters first
    if(from === 'km') meters = value * 1000;
    if(from === 'cm') meters = value / 100;

    let result = meters;
    if(to === 'km') result = meters / 1000;
    if(to === 'cm') result = meters * 100;

    document.getElementById('result').innerText = `Result: ${result} ${to}`;
}
