/**
 * Format angka ke format mata uang
 * @param {Number} amount - Jumlah yang akan diformat
 * @param {String} currency - Simbol mata uang (default: 'Rp')
 * @param {Boolean} useComma - Gunakan koma sebagai pemisah desimal (default: false)
 * @returns {String} Angka dalam format mata uang
 */
const formatCurrency = (amount, currency = 'Rp ', useComma = false) => {
    const formatter = new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    
    return `${currency}${formatter.format(amount)}${amount >= 1000 ? '+' : ''}`;
  };
  
  /**
   * Format tanggal ke format yang lebih mudah dibaca
   * @param {Date} date - Tanggal yang akan diformat
   * @param {String} locale - Locale untuk format (default: 'id-ID')
   * @returns {String} Tanggal dalam format yang mudah dibaca
   */
  const formatDate = (date, locale = 'id-ID') => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    
    return new Date(date).toLocaleDateString(locale, options);
  };
  
  /**
   * Potong teks jika terlalu panjang dan tambahkan ellipsis
   * @param {String} text - Teks yang akan dipotong
   * @param {Number} maxLength - Panjang maksimum (default: 100)
   * @returns {String} Teks yang sudah dipotong jika melebihi panjang maksimum
   */
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength) + '...';
  };
  
  /**
   * Generate slug dari string
   * @param {String} text - Teks yang akan dijadikan slug
   * @returns {String} Slug dari teks
   */
  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')      // Ganti spasi dengan -
      .replace(/[^\w\-]+/g, '')  // Hapus semua karakter non-word
      .replace(/\-\-+/g, '-')    // Ganti multiple - dengan satu -
      .replace(/^-+/, '')        // Trim - dari awal teks
      .replace(/-+$/, '');       // Trim - dari akhir teks
  };
  
  module.exports = {
    formatCurrency,
    formatDate,
    truncateText,
    slugify
  };