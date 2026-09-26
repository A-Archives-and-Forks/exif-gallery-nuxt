import { db } from '@nuxthub/db'
import { and, asc, desc, eq, inArray, like, or, sql } from 'drizzle-orm'

export default eventHandler(async (event) => {
  const query = getQuery(event)
  const {
    limit = 20,
    offset = 0,
    orderBy = 'takenAt',
    order = 'desc',
    tag,
    camera,
    lens,
    search,
  } = query

  const requestedLimit = Number(limit)
  const requestedOffset = Number(offset)
  const limitNum = Number.isFinite(requestedLimit)
    ? Math.max(Math.trunc(requestedLimit), 1)
    : 20
  const offsetNum = Number.isFinite(requestedOffset)
    ? Math.max(Math.trunc(requestedOffset), 0)
    : 0
  const conditions = []

  // hidden 字段暂保留在数据库中兼容历史数据，但公开图库目前不启用隐藏功能。

  // 相机筛选：格式为 "make|model" 或 "make"
  if (camera) {
    const cameraStr = String(camera)
    const parts = cameraStr.split('|')
    if (parts.length === 2) {
      const [make, model] = parts
      if (make)
        conditions.push(eq(schema.photo.make, make))
      if (model)
        conditions.push(eq(schema.photo.model, model))
    }
    else {
      conditions.push(like(schema.photo.make, `%${cameraStr}%`))
    }
  }

  // 镜头筛选
  if (lens)
    conditions.push(eq(schema.photo.lensModel, String(lens)))

  // 文本搜索条件：支持多关键词 AND 搜索（空格分隔）
  if (search) {
    const keywords = String(search).split(/\s+/).filter(Boolean)

    for (const keyword of keywords) {
      const keywordStr = `%${keyword}%`
      conditions.push(
        or(
          like(schema.photo.title, keywordStr),
          like(schema.photo.caption, keywordStr),
          like(schema.photo.semanticDescription, keywordStr),
          like(schema.photo.locationName, keywordStr),
          like(schema.photo.make, keywordStr),
          like(schema.photo.model, keywordStr),
          like(schema.photo.lensModel, keywordStr),
          like(schema.photo.tags, keywordStr),
        ),
      )
    }
  }

  const orderColumn = orderBy === 'createdAt'
    ? schema.photo.createdAt
    : schema.photo.takenAt
  const orderExpression = order === 'asc' ? asc(orderColumn) : desc(orderColumn)
  const photoConditions = conditions.length > 0 ? and(...conditions) : undefined
  const queryLimit = limitNum + 1

  if (tag) {
    // 标量 tag 是一个完整标签；只有重复的 tag 参数才表示多标签筛选。
    const tagNames = (Array.isArray(tag) ? tag : [tag]).map(String).filter(Boolean)
    const matchedPhotoIds = db.$with('matched_photo_ids').as(
      tagNames.length === 1
        ? db.select({ photoId: schema.photoTag.photoId })
            .from(schema.photoTag)
            .innerJoin(schema.tag, eq(schema.photoTag.tagId, schema.tag.id))
            .where(eq(schema.tag.name, tagNames[0]!))
        : db.select({ photoId: schema.photoTag.photoId })
            .from(schema.photoTag)
            .innerJoin(schema.tag, eq(schema.photoTag.tagId, schema.tag.id))
            .where(inArray(schema.tag.name, tagNames))
            .groupBy(schema.photoTag.photoId)
            .having(sql`count(distinct ${schema.tag.name}) = ${tagNames.length}`),
    )

    const rows = await db
      .with(matchedPhotoIds)
      .select({ photo: schema.photo })
      .from(matchedPhotoIds)
      .innerJoin(schema.photo, eq(matchedPhotoIds.photoId, schema.photo.id))
      .where(photoConditions)
      .orderBy(orderExpression)
      .limit(queryLimit)
      .offset(offsetNum)

    const hasMore = rows.length > limitNum

    return {
      data: rows.slice(0, limitNum).map(row => row.photo),
      hasMore,
      limit: limitNum,
      offset: offsetNum,
    }
  }

  const photos = await db.query.photo.findMany({
    where: photoConditions,
    limit: queryLimit,
    offset: offsetNum,
    orderBy: orderExpression,
  })
  const hasMore = photos.length > limitNum

  return {
    data: photos.slice(0, limitNum),
    hasMore,
    limit: limitNum,
    offset: offsetNum,
  }
})
