'use client'
import { useState } from 'react';
import { supabase } from '../_lib/supabaseClient';
import { useRouter } from 'next/navigation';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    const { data, error } = await supabase
      .from('Students')
      .select('*')
      .eq('username', parseInt(username))
      .eq('password', parseInt(password));

    console.log(data, error);
    if (data && data.length > 0) {
      // Store user session (use localStorage for simplicity)
      localStorage.setItem('user', JSON.stringify(data[0]));
      router.push('/');
    } else {
      alert('Invalid username or password');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <input
        type="number"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="number"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
