-- 同步所有课程的报名人数
-- 此脚本用于修复 enrolled_count 字段与实际报名学员数不一致的问题

-- 更新所有课程的 enrolled_count 为实际的学员数
UPDATE courses
SET enrolled_count = (
    SELECT COUNT(*)
    FROM course_students
    WHERE course_id = courses.id
);

-- 查看更新后的结果
SELECT
    id,
    name,
    enrolled_count as stored_count,
    (SELECT COUNT(*) FROM course_students WHERE course_id = courses.id) as actual_count,
    max_students
FROM courses
ORDER BY enrolled_count DESC;
