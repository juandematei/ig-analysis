function parseEntry(item) {
  const d = item.string_list_data?.[0]
  if (!d?.value) return null
  return {
    username: d.value,
    href: d.href || `https://www.instagram.com/_u/${d.value}`,
    timestamp: d.timestamp || 0,
  }
}

export function parseFollowers(json) {
  if (!Array.isArray(json)) return []
  return json.map(parseEntry).filter(Boolean)
}

export function parseFollowing(json) {
  const arr = Array.isArray(json) ? json : (json?.relationships_following ?? [])
  return arr.map(parseEntry).filter(Boolean)
}

export function computeStats(followers, following) {
  const followerSet = new Set(followers.map(u => u.username))
  const followingSet = new Set(following.map(u => u.username))
  const isDeleted = u => u.username.startsWith('__deleted__')
  return {
    followersCount: followers.length,
    followingCount: following.length,
    notFollowingBack: following.filter(u => !followerSet.has(u.username) && !isDeleted(u)),
    deletedCount: following.filter(isDeleted).length,
    fans: followers.filter(u => !followingSet.has(u.username)),
    mutual: followers.filter(u => followingSet.has(u.username)),
  }
}

export function diffSnapshots(oldFollowers, newFollowers) {
  const oldSet = new Set(oldFollowers.map(u => u.username))
  const newSet = new Set(newFollowers.map(u => u.username))
  return {
    unfollowers: oldFollowers.filter(u => !newSet.has(u.username) && !u.username.startsWith('__deleted__')),
    newFollowers: newFollowers.filter(u => !oldSet.has(u.username)),
  }
}
