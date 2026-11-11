import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'

export default function ResetPassword() {
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let mounted = true
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted && (event === 'PASSWORD_RECOVERY' || Boolean(session))) setReady(true)
    })
    supabase.auth.getSession().then(({ data: sessionData }) => {
      if (mounted && sessionData.session) setReady(true)
    })
    return () => {
      mounted = false
      data.subscription.unsubscribe()
    }
  }, [])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }
    if (password !== confirmation) {
      setError('The passwords do not match.')
      return
    }
    setSaving(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setSaving(false)
    if (updateError) {
      setError(`Could not update your password: ${updateError.message}`)
      return
    }
    setSaved(true)
    window.history.replaceState({}, '', '/')
  }

  if (saved) {
    return <main className="auth-page"><section className="auth-card"><h1>Password updated</h1><p>You can now return to the student portal and sign in.</p></section></main>
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>Set a new password</h1>
        <p>Choose a secure password for your student account.</p>
        {!ready && <p role="status">Verifying reset link...</p>}
        {error && <p role="alert">{error}</p>}
        <label>New password<input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        <label>Confirm password<input type="password" autoComplete="new-password" minLength={8} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label>
        <button type="submit" disabled={!ready || saving}>{saving ? 'Saving...' : 'Save password'}</button>
      </form>
    </main>
  )
}
