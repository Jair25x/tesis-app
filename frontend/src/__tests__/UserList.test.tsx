import { render, screen } from '@testing-library/react'
import React from 'react'
import { vi } from 'vitest'
import UserList from '../pages/admin/UserList'

vi.mock('../hooks/useAdminUsers', () => ({
  useAdminUsers: () => ({
    users: [
      { id: 1, username: 'john', email: 'j@example.com', roles: ['USER'], enabled: true, fechaRegistro: '' }
    ],
    loading: false,
    error: null,
    refresh: vi.fn(),
  }),
}))

vi.mock('../hooks/useApi', () => ({
  useApi: () => ({ execute: vi.fn(), isLoading: false, error: null }),
}))

vi.mock('react-router-dom', () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}))

describe('UserList', () => {
  it('renders rows after fetch', () => {
    render(<UserList />)
    expect(screen.getByText('john')).toBeInTheDocument()
  })
})
