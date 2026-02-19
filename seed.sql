INSERT INTO users (name, email, role, avatar_url) VALUES ('Vladimir Lebedko', 'vladimir@example.com', 'Member', 'https://avatar.iran.liara.run/public/1');
INSERT INTO users (name, email, role) VALUES ('Admin User', 'admin@example.com', 'Admin');

INSERT INTO products (name, description, icon_color) VALUES ('VK для iOS', 'Official VK app for iOS devices', '#0077FF');
INSERT INTO products (name, description, icon_color) VALUES ('VK для Android', 'Official VK app for Android devices', '#4CAF50');

INSERT INTO bugs (
    title, description, issue_type, severity, status, version, device, platform, 
    steps, actual_result, expected_result, tags, product_id, reporter_id
) VALUES (
    'Не отображается автор клипа, открытого из пересланного поста из канала',
    'Description for the bug related to clip author visibility.',
    'Data damaged',
    'Medium',
    'Under review',
    '8.162 (7638)',
    'Apple MTQC3ZA/A iPhone 15 Pro',
    'iOS 26',
    '1. Переслать пост с клипом из канала в чат. Например, https://vk.com/im/channels/-228664366?cmid=768;\n2. Открыть клип из пересланного сообщения.',
    'У клипа не отображается автор. Он отображается, если открывать из канала.',
    'Автор клипа должен отображаться.',
    '["Сообщения"]',
    1,
    1
);

INSERT INTO comments (bug_id, user_id, content) VALUES (1, 1, 'First comment about the bug.');
INSERT INTO status_changes (bug_id, user_id, old_status, new_status) VALUES (1, 1, 'Open', 'Under review');
