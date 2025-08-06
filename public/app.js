setInterval(() => {
  fetch('/api/status')
    .then(r => r.json())
    .then(d => console.log(d));
}, 3000);
