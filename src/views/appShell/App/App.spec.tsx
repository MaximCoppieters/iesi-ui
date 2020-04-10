import React from 'react';
import { render } from '@testing-library/react';
import setMockState from 'utils/test/setMockState';
import App from '.';

describe('App component:', () => {
    it('renders properly', () => {
        setMockState();

        const { getByText } = render(<App />);

        const linkElement = getByText(/app_shell.header.title/i);
        expect(linkElement).toBeInTheDocument();
    });
});