import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import EditUser from '../pages/admin/EditUser'
import * as adminService from '../services/adminService'

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useParams: () => ({ id: '1' }),
  }
})

const getUserMock = vi.fn()
const updateUserMock = vi.fn()

vi.mock('../hooks/useApi', () => {
  return {
    useApi: (fn: unknown) => {
      if (fn === adminService.getUserById) {
        return { execute: getUserMock, isLoading: false, error: null }
      }
      if (fn === adminService.updateUser) {
        return { execute: updateUserMock, isLoading: false, error: null }
      }
      return { execute: vi.fn(), isLoading: false, error: null }
    },
  }
})

describe('EditUser', () => {
  const user = {
    id: 1,
    username: 'john',
    email: 'j@example.com',
    roles: ['USER'],
    enabled: true,
    fechaRegistro: '',
    nombres: 'John',
    apellidos: 'Doe',
  }

  beforeEach(() => {
    getUserMock.mockResolvedValue(user)
    updateUserMock.mockResolvedValue(user)
  })

  it('submits updated data and shows success', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
    render(<EditUser />)

    await waitFor(() => expect(screen.getByDisplayValue('John')).toBeInTheDocument())

    const nombresInput = screen.getByDisplayValue('John')
    await userEvent.clear(nombresInput)
    await userEvent.type(nombresInput, 'Jane')

    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => expect(updateUserMock).toHaveBeenCalled())
    expect(updateUserMock).toHaveBeenCalledWith(1, expect.objectContaining({ nombres: 'Jane' }))
    expect(alertMock).toHaveBeenCalledWith('Usuario actualizado correctamente.')
    expect(navigateMock).toHaveBeenCalledWith('/admin/users')
  })

  it('shows error state on failure', async () => {
    const error = new Error('fail')
    updateUserMock.mockRejectedValueOnce(error)
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<EditUser />)

    await waitFor(() => expect(screen.getByDisplayValue('John')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => expect(updateUserMock).toHaveBeenCalled())
    expect(consoleSpy).toHaveBeenCalledWith(error)
  })
})
