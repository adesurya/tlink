// File: public/js/admin.js

/**
 * File JavaScript khusus untuk admin panel
 */
document.addEventListener('DOMContentLoaded', function() {
  // Sidebar toggle untuk mobile
  const sidebarToggle = document.getElementById('sidebarToggle');
  const adminSidebar = document.getElementById('adminSidebar');
  
  if (sidebarToggle && adminSidebar) {
    sidebarToggle.addEventListener('click', function() {
      adminSidebar.classList.toggle('active');
      // Tambahkan/hapus class untuk body untuk menghindari scrolling
      document.body.classList.toggle('sidebar-open');
    });
  }
  
  // Dropdown user di header
  const adminUserDropdown = document.getElementById('adminUserDropdown');
  const adminDropdownMenu = document.getElementById('adminDropdownMenu');
  
  if (adminUserDropdown && adminDropdownMenu) {
    adminUserDropdown.addEventListener('click', function(e) {
      e.stopPropagation();
      adminDropdownMenu.classList.toggle('active');
    });
    
    // Tutup dropdown saat mengklik di luar
    document.addEventListener('click', function(e) {
      if (adminDropdownMenu.classList.contains('active') && 
          !adminUserDropdown.contains(e.target) && 
          !adminDropdownMenu.contains(e.target)) {
        adminDropdownMenu.classList.remove('active');
      }
    });
  }
  
  // Konfirmasi sebelum menghapus item
  const deleteButtons = document.querySelectorAll('.delete-btn');
  
  if (deleteButtons.length > 0) {
    deleteButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        if (!confirm('Apakah Anda yakin ingin menghapus item ini?')) {
          e.preventDefault();
        }
      });
    });
  }
  
  // Responsive table untuk mobile view
  const resizeTables = function() {
    const tables = document.querySelectorAll('.admin-table');
    const windowWidth = window.innerWidth;
    
    if (tables.length > 0 && windowWidth < 768) {
      tables.forEach(table => {
        table.classList.add('responsive-table');
      });
    } else {
      tables.forEach(table => {
        table.classList.remove('responsive-table');
      });
    }
  };
  
  // Jalankan saat load dan resize window
  resizeTables();
  window.addEventListener('resize', resizeTables);
  
  // Toggle form sections jika ada
  const formSectionToggles = document.querySelectorAll('.form-section-toggle');
  
  if (formSectionToggles.length > 0) {
    formSectionToggles.forEach(toggle => {
      toggle.addEventListener('click', function() {
        const targetId = this.dataset.target;
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
          targetSection.classList.toggle('collapsed');
          this.querySelector('i').classList.toggle('fa-chevron-down');
          this.querySelector('i').classList.toggle('fa-chevron-up');
        }
      });
    });
  }
  
  // Auto-hide alerts after 5 seconds
  const alerts = document.querySelectorAll('.alert');
  
  if (alerts.length > 0) {
    setTimeout(() => {
      alerts.forEach(alert => {
        alert.style.opacity = '0';
        setTimeout(() => {
          alert.style.display = 'none';
        }, 300);
      });
    }, 5000);
  }
  
  // Scrollable Tables Indicators
  const tableContainers = document.querySelectorAll('.table-container');
  
  if (tableContainers.length > 0) {
    tableContainers.forEach(container => {
      // Check if table is wider than container
      const table = container.querySelector('table');
      
      if (table && table.offsetWidth > container.offsetWidth) {
        container.classList.add('scrollable');
        
        // Add scroll indicators
        const indicators = document.createElement('div');
        indicators.className = 'table-scroll-indicator';
        container.appendChild(indicators);
        
        // Show/hide indicators based on scroll position
        container.addEventListener('scroll', function() {
          const maxScroll = container.scrollWidth - container.clientWidth;
          const currentScroll = container.scrollLeft;
          
          // If at start, hide left indicator
          if (currentScroll <= 10) {
            indicators.classList.remove('show-left');
          } else {
            indicators.classList.add('show-left');
          }
          
          // If at end, hide right indicator
          if (maxScroll - currentScroll <= 10) {
            indicators.classList.remove('show-right');
          } else {
            indicators.classList.add('show-right');
          }
        });
        
        // Trigger scroll event to initialize indicators
        container.dispatchEvent(new Event('scroll'));
      }
    });
  }
});