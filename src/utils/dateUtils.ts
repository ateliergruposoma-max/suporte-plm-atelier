export const formatTicketDate = (dateStr: string | undefined) => {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    
    // Check if it's a valid date (ISO format)
    if (!isNaN(date.getTime())) {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date).replace('.', '');
    }

    // Fallback for existing "DD/MM/YYYY HH:mm:ss" format
    const [datePart, timePart] = dateStr.split(' ');
    if (datePart && timePart) {
      const [day, month] = datePart.split('/');
      const [hour, minute] = timePart.split(':');
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const monthName = months[parseInt(month) - 1];
      return `${day} ${monthName}, ${hour}:${minute}`;
    }
    
    return dateStr;
  } catch (e) {
    return dateStr;
  }
};
