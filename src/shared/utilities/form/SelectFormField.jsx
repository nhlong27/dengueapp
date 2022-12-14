import {
  FormControl,
  formControlClasses,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import zIndex from '@mui/material/styles/zIndex';
import { getIn } from 'formik';
import React from 'react';

const SelectFormField = ({ field, form, label, options, ...props }) => {
  const errorText = getIn(form.touched, field.name) && getIn(form.errors, field.name);

  return (
    <FormControl fullWidth error={!!errorText}>
      {label && <InputLabel>{label}</InputLabel>}
      <Select style={{ width: 200 }} {...field} {...props}>
        {options &&
         options.map((option, index) => (
            <MenuItem key={index} value={option.R_Number}>
              {option.R_Number}
            </MenuItem>
          ))}
      </Select>
      <FormHelperText>{errorText}</FormHelperText>
    </FormControl>
  );
};

export default SelectFormField;
