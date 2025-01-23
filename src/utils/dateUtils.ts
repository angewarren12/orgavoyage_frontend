export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(date);
};

export const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

export const formatDuration = (duration: string): string => {
    // Format ISO 8601 duration (e.g., "PT2H30M") to readable format (e.g., "2h 30m")
    const hours = duration.match(/(\d+)H/);
    const minutes = duration.match(/(\d+)M/);
    
    let result = '';
    if (hours) result += `${hours[1]}h `;
    if (minutes) result += `${minutes[1]}m`;
    
    return result.trim();
};
