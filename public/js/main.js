document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality for campaign tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    const toggleBtn = document.getElementById("hamburgerToggle");
    const navMenu = document.getElementById("mobileNav");
  
    toggleBtn.addEventListener("click", () => {
      navMenu.classList.toggle("show");
    });
    if (tabButtons.length > 0) {
      tabButtons.forEach(button => {
        button.addEventListener('click', function() {
          // Remove active class from all buttons
          tabButtons.forEach(btn => btn.classList.remove('active'));
          
          // Add active class to clicked button
          this.classList.add('active');
          
          // Here you would add functionality to show/hide tab content
          const tabId = this.textContent.trim().toLowerCase().replace(' ', '-');
          console.log(`Tab clicked: ${tabId}`);
          
          // Placeholder for tab content switching logic
          // const tabContents = document.querySelectorAll('.tab-content');
          // tabContents.forEach(content => content.style.display = 'none');
          // document.getElementById(`${tabId}-content`).style.display = 'block';
        });
      });
    }
    
    // Mobile category navigation scrolling
    const categoryNav = document.querySelector('.category-nav ul');
    if (categoryNav) {
      // Add scroll event to check when to show shadow indicators
      categoryNav.addEventListener('scroll', function() {
        const isScrollable = this.scrollWidth > this.clientWidth;
        const isScrolledToStart = this.scrollLeft <= 10;
        const isScrolledToEnd = this.scrollLeft + this.clientWidth >= this.scrollWidth - 10;
        
        // You could add shadow indicators or buttons to show that there's more content
        // to scroll left/right
        console.log(`Scrollable: ${isScrollable}, At start: ${isScrolledToStart}, At end: ${isScrolledToEnd}`);
      });
    }
    
    // Product category scrolling
    const categoryItems = document.querySelector('.category-items');
    if (categoryItems) {
      // Similar scroll event handling
      categoryItems.addEventListener('scroll', function() {
        const isScrollable = this.scrollWidth > this.clientWidth;
        const isScrolledToStart = this.scrollLeft <= 10;
        const isScrolledToEnd = this.scrollLeft + this.clientWidth >= this.scrollWidth - 10;
        
        console.log(`Categories Scrollable: ${isScrollable}, At start: ${isScrolledToStart}, At end: ${isScrolledToEnd}`);
      });
    }
    
    // Affiliate link click tracking
    const affiliateLinks = document.querySelectorAll('a[href*="/affiliate"]');
    if (affiliateLinks.length > 0) {
      affiliateLinks.forEach(link => {
        link.addEventListener('click', function(e) {
          // Optional: Google Analytics or custom tracking event
          console.log('Affiliate link clicked:', this.href);
          
          // If you want to do something before redirect, you could preventDefault() here
          // and then manually redirect after your tracking/logic completes
          // e.preventDefault();
          // setTimeout(() => { window.location = this.href; }, 100);
        });
      });
    }
    
    // Filter form handling for product listing
    const filterForm = document.querySelector('.filter-form');
    if (filterForm) {
      // For checkboxes that should refresh the page immediately when changed
      const instantFilters = filterForm.querySelectorAll('input[type="checkbox"], input[type="radio"]');
      instantFilters.forEach(filter => {
        filter.addEventListener('change', function() {
          // Submit the form when a filter is changed
          filterForm.submit();
        });
      });
    }
  });