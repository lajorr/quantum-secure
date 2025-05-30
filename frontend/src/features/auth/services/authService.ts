// Mock user data
const mockUsers = [
  { name: 'John Doe', email: 'john@example.com', password: 'password123', id: '1', avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg' },
  { name: 'Jane Smith', email: 'jane@example.com', password: 'password456', id: '2', avatarUrl: 'https://randomuser.me/api/portraits/women/2.jpg' },
];

// Mock login function
export const login = (email: string, password: string): Promise<{ success: boolean; message: string; user?: typeof mockUsers[0] }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = mockUsers.find(u => u.email === email && u.password === password);
      if (user) {
        resolve({ success: true, message: 'Login successful', user });
      } else {
        resolve({ success: false, message: 'Invalid email or password' });
      }
    }, 1000); // Simulate network delay
  });
};

// Mock signup function
export const signup = (name: string, email: string, password: string): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (mockUsers.some(u => u.email === email)) {
        resolve({ success: false, message: 'Email already in use' });
      } else {
        const newUser = { name, email, password, id: (mockUsers.length + 1).toString(), avatarUrl: 'https://randomuser.me/api/portraits/men/10.jpg' };
        mockUsers.push(newUser);
        resolve({ success: true, message: 'Signup successful' });
      }
    }, 1000); // Simulate network delay
  });
}; 