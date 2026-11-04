import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CriticPassWheel } from './CriticPassWheel'
import { renderApp } from '../test/utils'

describe('CriticPassWheel', () => {
  it('desbloquea la ruleta al alcanzar las 50 reseñas (3 estrellas)', async () => {
    const user = userEvent.setup()
    renderApp(<CriticPassWheel userReviewsCount={10} communityReviewsCount={10} />)

    // Con 10 reseñas el botón de la ruleta está deshabilitado
    const wheelBtn = screen.getByRole('button', { name: /Faltan 40 reseñas para la Ruleta/i })
    expect(wheelBtn).toBeDisabled()

    // Cargamos la etapa 3★ (50 reseñas)
    await user.click(screen.getByRole('button', { name: /3★ \(50 ¡Ruleta!\)/i }))

    const enabledWheelBtn = screen.getByRole('button', { name: /Girar Ruleta Petite Critique/i })
    expect(enabledWheelBtn).toBeEnabled()

    await user.click(enabledWheelBtn)
    expect(await screen.findByRole('dialog', { name: /Ruleta Gourmet de Petite Critique/i })).toBeInTheDocument()
  })
})

