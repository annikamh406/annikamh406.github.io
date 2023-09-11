// Set the initial state to hidden
document.addEventListener("DOMContentLoaded", (event) => {
    const menu = document.querySelector('.mobile-nav');
    menu.style.display = 'none';
  });
  
  function toggleMenu() {
    const menu = document.querySelector('.mobile-nav');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}
