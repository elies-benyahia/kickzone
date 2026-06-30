const axios = require('axios');

const getPlayerImageFromWikipedia = async (playerName) => {
  try {
    const res = await axios.get('https://en.wikipedia.org/w/api.php', {
      params: {
        action: 'query',
        titles: playerName,
        prop: 'pageimages',
        format: 'json',
        pithumbsize: 400,
        origin: '*',
      },
      timeout: 5000,
    });
    const pages = res.data?.query?.pages || {};
    const page = Object.values(pages)[0];
    return page?.thumbnail?.source || null;
  } catch {
    return null;
  }
};

const getPlayerAvatar = (playerName) => {
  const initials = playerName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=1a56db&color=fff&size=200`;
};

module.exports = { getPlayerImageFromWikipedia, getPlayerAvatar };
