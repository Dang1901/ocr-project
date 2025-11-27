import React from 'react';
import { Input } from 'antd';
import { IconSearch } from '@tabler/icons-react';
import { colors } from '@config/colors';

interface InputFilterProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onPressEnter?: () => void;
  placeholder?: string;
  width?: number;
  allowClear?: boolean;
}

const InputFilter: React.FC<InputFilterProps> = ({
  label,
  value,
  onChange,
  onPressEnter,
  placeholder = "Search...",
  width = 200,
  allowClear = true,
}) => {
  return (
    <div style={{ width, display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: "13px", fontWeight: "600", color: "#000000" }}>
        {label}
      </label>
      <Input
        value={value}
        allowClear={allowClear}
        placeholder={placeholder}
        prefix={<IconSearch size={16} style={{ color: colors.textPrimary }} />}
        onChange={(e) => onChange(e.target.value)}
        onPressEnter={onPressEnter}
        style={{
          borderColor: '#e2e8f0'
        }}
      />
    </div>
  );
};

export default InputFilter;

