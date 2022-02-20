import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components'

export const ButtonStyles = styled.button`
  background-color: ${({ primary }) => primary ? '#00ce89' : '#fff'};
  border: none;
  border-radius: 30px;
  box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.16);
  color: ${({ primary }) => primary ? '#fff' : '#00ce89'};
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  padding: 18px;
`;

export const Button = ({ label, primary = false, onClick }) => (
  <ButtonStyles primary={primary} onClick={onClick}>{label}</ButtonStyles>
);

Button.PropTypes = {
  label: PropTypes.string.isRequired,
  primary: PropTypes.bool,
  onClick: PropTypes.func,
};
