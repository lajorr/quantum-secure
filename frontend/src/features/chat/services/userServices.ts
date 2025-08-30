import api from '../../../api/api'

export const updateUser = async ( newUsername: string) => {
  try {
    const response = await api.patch(`/users/changeUsername`, {
      username: newUsername,
    })

    return response.data
  } catch (e) {
    console.log('Error updating username', e)
    throw e
  }
}

export const updatePassword = async(currentPassword: string, newPassword: string) => {
  try {
    const response = await api.patch(`/users/changePassword`, {
      current_password: currentPassword,
      new_password: newPassword,
    })
    return response.data
  }
  catch (e) {
    console.log('Error updating password', e)
    throw e
  }

}