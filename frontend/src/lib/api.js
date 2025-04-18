export const fetchHabits = async (userId) => {
    const res = await fetch(`/api/habits/${userId}/habits`);
    return await res.json();
  };
  
  export const addHabit = async (userId, habit) => {
    const res = await fetch(`/api/habits/${userId}/habits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(habit),
    });
    return await res.json();
  };
  
  export const updateStats = async (userId, stats) => {
    const res = await fetch(`/api/habits/${userId}/stats`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stats),
    });
    return await res.json();
  };
  