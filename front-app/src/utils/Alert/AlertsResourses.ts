
export function alertAddFriend(user : string | undefined) {
    return ("You added " + user + " to friends")
}

export function alertRemoveFriend(user : string) {
    if(user)
        return ("You removed " + user + " from friends")
    else
        return ("You removed this user from friends:)")
}