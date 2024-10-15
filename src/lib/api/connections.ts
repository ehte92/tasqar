export async function addConnection(email: string): Promise<void> {
  const response = await fetch('/api/connections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to add connection');
  }
}

export async function checkUserExists(email: string): Promise<boolean> {
  const response = await fetch(
    `/api/users/exists?email=${encodeURIComponent(email)}`
  );
  if (!response.ok) {
    throw new Error('Failed to check user existence');
  }
  return response.json();
}

export async function inviteUser(email: string): Promise<void> {
  const response = await fetch('/api/invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to send invitation');
  }
}
