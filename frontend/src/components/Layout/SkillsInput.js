import React, { useState } from 'react';

const SkillsInput = ({ skills = [], onChange, placeholder = 'Type a skill and press Enter...' }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      const newSkill = inputValue.trim();
      if (!skills.find(s => s.toLowerCase() === newSkill.toLowerCase())) {
        onChange([...skills, newSkill]);
      }
      setInputValue('');
    }
    if (e.key === 'Backspace' && !inputValue && skills.length > 0) {
      onChange(skills.slice(0, -1));
    }
  };

  const removeSkill = (index) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  return (
    <div className="skills-input-wrapper">
      {skills.map((skill, index) => (
        <span key={index} className="skill-chip">
          {skill}
          <button onClick={() => removeSkill(index)} type="button">&times;</button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={skills.length === 0 ? placeholder : ''}
      />
    </div>
  );
};

export default SkillsInput;
