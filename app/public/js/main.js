// Auto close alert setelah 3 detik
document.addEventListener("DOMContentLoaded", () => {
  const alerts = document.querySelectorAll(".alert");
  alerts.forEach(alert => {
    setTimeout(() => {
      alert.classList.add("fade");
      alert.classList.remove("show");
    }, 3000);
  });
});

// Highlight deadline yang sudah lewat
document.addEventListener("DOMContentLoaded", () => {
  const rows = document.querySelectorAll("tbody tr");

  rows.forEach(row => {
    const deadlineCell = row.children[2];
    if (!deadlineCell) return;

    const deadline = new Date(deadlineCell.innerText);
    const today = new Date();

    if (deadline < today) {
      row.classList.add("table-danger");
    }
  });
});
