'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './Modal';
import { useAuth } from './../context/AuthContext'; // 使用 AuthContext
import './loginModal.css';

const LoginModal = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { setToken, verifyToken, isAuthenticated, logout } = useAuth(); // 获取 logout 方法
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token); // 更新全局 token
        setIsOpen(false); // 登录成功后关闭弹窗
        verifyToken(); // 验证 token
        // window.location.href = '/'; // 使用 window.location.href 进行页面刷新
    } else {
        setError(data.message);
      }
    } catch (err) {
      setError('发生未知错误，请稍后重试');
    }
  };

  const handleLogout = () => {
    logout(); // 调用 logout 方法
    // window.location.href = '/'; // 使用 window.location.href 进行页面刷新
};

  return (
    <>
      {!isAuthenticated && <button onClick={() => setIsOpen(true)}>登录</button>}
      {isAuthenticated && <button onClick={handleLogout}>退出</button>}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <h3>登录</h3>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit">登录</button>
        </form>
      </Modal>
    </>
  );
};

export default LoginModal;
