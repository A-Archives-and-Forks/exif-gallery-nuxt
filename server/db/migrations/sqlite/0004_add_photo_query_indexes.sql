DROP INDEX `idx_photos_hidden`;--> statement-breakpoint
DROP INDEX `idx_photo_tags_tag_id`;--> statement-breakpoint
CREATE INDEX `idx_photo_tags_tag_id_photo_id` ON `photo_tags` (`tag_id`,`photo_id`);