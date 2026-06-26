const prisma = require('./prismaClient');

const slugify = (text) =>
  text.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80);

const makeUniqueSlug = async (base) => {
  let slug = base;
  let i = 1;
  while (await prisma.article.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
};

const getArticles = async ({ category, page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const where = category ? { category } : {};
  const [data, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.article.count({ where }),
  ]);
  return { data, meta: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } };
};

const getArticleBySlug = async (slug) => {
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article) { const err = new Error('Article not found'); err.status = 404; throw err; }
  return article;
};

const createArticle = async ({ title, summary, content, imageUrl, category, author, publishedAt }) => {
  const base = slugify(title);
  const slug = await makeUniqueSlug(base);
  return prisma.article.create({
    data: { title, slug, summary, content, imageUrl, category, author, publishedAt: publishedAt ? new Date(publishedAt) : new Date() },
  });
};

const updateArticle = async (id, fields) => {
  return prisma.article.update({ where: { id: Number(id) }, data: fields });
};

const deleteArticle = async (id) => {
  return prisma.article.delete({ where: { id: Number(id) } });
};

module.exports = { slugify, getArticles, getArticleBySlug, createArticle, updateArticle, deleteArticle };
