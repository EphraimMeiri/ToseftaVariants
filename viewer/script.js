function displayText(jsonData) {
    const mainTextContainer = document.getElementById('main-text-container');
    const textArray = jsonData.text[0]; // Assuming we want the first array in the 'text' field

    textArray.forEach(textItem => {
        const paragraph = document.createElement('p');
        paragraph.className = 'text-content';
        paragraph.innerHTML = textItem; // Using innerHTML to preserve HTML tags in the text
        container.appendChild(paragraph);
    });
}

document.addEventListener("DOMContentLoaded", function() {
    // const variantsContainer = document.getElementById('variants-container');

    // Load main text json
fetch('Tosefta_Meglillah.json')
    .then(response => response.json())
    .then(data => {
        displayText(data);
    })
    .catch(error => console.error('Error:', error));

    // // Load variants json
    // fetch('Variants_Megillah.json')
    //     .then(response => response.json())
    //     .then(data => {
    //         data.variants.forEach(variant => {
    //             const variantElement = document.createElement('div');
    //             variantElement.innerHTML = variant.text;
    //             variantsContainer.appendChild(variantElement);
    //         });
    //     })
    //     .catch(error => console.error('Error:', error));

});
