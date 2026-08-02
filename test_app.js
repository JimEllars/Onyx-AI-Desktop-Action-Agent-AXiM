fetch('http://localhost:5173')
  .then(res => res.text())
  .then(console.log)
  .catch(console.error);
