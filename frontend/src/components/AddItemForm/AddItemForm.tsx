import React, { useState } from 'react';
import { apiService } from '../../services/api';
import './AddItemForm.css';

interface AddItemFormProps {
  onItemAdded: () => void;
}

export const AddItemForm: React.FC<AddItemFormProps> = ({ onItemAdded }) => {
  const [id, setId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const idNum = parseInt(id, 10);
    if (isNaN(idNum) || idNum <= 0) {
      setError('ID должен быть положительным целым числом');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.addItem(idNum);
      if (response.success) {
        setSuccess(true);
        setId('');
        onItemAdded();
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError(response.error || 'Ошибка при добавлении элемента');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка при добавлении элемента');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="add-item-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="item-id">Добавить элемент с ID:</label>
        <input
          id="item-id"
          type="number"
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="Введите ID"
          disabled={loading}
          min="1"
          required
        />
      </div>
      <button type="submit" disabled={loading || !id}>
        {loading ? 'Добавление...' : 'Добавить'}
      </button>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Элемент успешно добавлен!</div>}
    </form>
  );
};

