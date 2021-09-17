const fromSelect = document.getElementById('from_select')
const toSelect = document.getElementById('to_select')
const fromText = document.getElementById('from_text')
const toText = document.getElementById('to_text')
const form = document.getElementById('form')
const fragment = document.createDocumentFragment()
const button = document.getElementById('submit')
const loading = document.getElementById('loading')

document.addEventListener('DOMContentLoaded', async () => {
  loading.style.display = 'none'
  try{
    fetch('http://localhost:3000/api/currencies')
    .then((response) => response.json())
    .then((content) => createOptions(content))
    .catch((err) => console.log(err))
  }
  catch(err){
    alert(err)
  }
}) 

form.addEventListener('submit', (e) =>{
  e.preventDefault()
  button.disabled = true;
  loading.style.display = 'inline'
  
  if(fromText.value.trim(' ') == '' || fromText.value.trim(' ') == 0){
    alert('Insert a value')
    enableButton()
    return
  }
  if(fromSelect.value === toSelect.value){
    toText.value = fromText.value
    enableButton()
    return
  }
  try{
    fetch(`http://localhost:3000/api?currencies=${fromSelect.value},${toSelect.value}`)
    .then((response) => response.json())
    .then((content) => {
      if(content.message == false){
        alert('There was an error connecting to the API')
        enableButton()
        return
      }
      toText.value = content.rate * fromText.value
      enableButton()
    })
    .catch((err) => {
      alert('There was an error connecting to the API')
      enableButton()
    })
  }
  catch(err){
    alert(err)
    enableButton()
  }
})

function enableButton(){
  button.disabled = false;
  loading.style.display = 'none';
}

function createOptions(currencies){
  for (var currency of Object.keys(currencies)){
    var option = document.createElement('option')
    option.innerText = currency
    fragment.append(option)
  }
  const fragmentClone = fragment.cloneNode(true)
  fromSelect.append(fragment)
  toSelect.append(fragmentClone)
}