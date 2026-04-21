#!/usr/bin/env python3
import sys

filepath = 'src/lib/sampleData.ts'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_question = """    { text: "【R03-労基選択】次の文中の空欄（ア）〜（オ）に入る語句として正しいものを選べ。\\n\\n労働基準法の「労働契約」及び「賃金」に関する規定について：\\n\\n「使用者は、労働契約の締結に際し、労働者に対して賃金、労働時間その他の労働条件を（ア）しなければならない。」\\n\\n「賃金とは、賃金、給料、手当、賞与その他名称の如何を問わず、労働の（イ）として使用者が労働者に支払うすべてのものをいう。」\\n\\n「使用者は、賃金を通貨で、（ウ）に、毎月（エ）回以上、一定の期日を定めて支払わなければならない。ただし、臨時に支払われる賃金、賞与その他これに準ずるものは、この限りでない。」\\n\\n「労働者が退職の場合において、権利者の請求があった場合においては、使用者は、（オ）日以内に賃金を支払い、積立金、保証金、貯蓄金その他名称の如何を問わず、労働者の権利に属する金品を返還しなければならない。」", correctAnswers: ['明示', '対償', '直接労働者', '1', '7'], additionalChoices: ['交付', '報酬', '口座振込で', '2', '14', '書面で', '代価', '全額', '3', '30', '告知', '対価', '遅滞なく', '4', '5', '通知', '見返り', '現金で', '6', '10'] , explanation: '①労働条件の明示（労基法15条）：使用者は労働契約締結時に労働条件を明示する義務がある。②賃金の定義（11条）：労働の対償として支払うすべてのもの。③賃金支払の5原則（24条）：通貨・直接・全額・毎月1回以上・一定期日払い。④退職時の金品返還（23条）：請求から7日以内。' },
"""

# Find s1's closing ], (line before s2:)
insert_idx = None
for i, line in enumerate(lines):
    if 's2: [' in line:
        # Insert before the ], line which is the line before s2:
        insert_idx = i - 1
        break

if insert_idx is None:
    print("ERROR: s2: [ が見つかりません")
    sys.exit(1)

# The line at insert_idx should be "  ],"
print(f"Insert before line {insert_idx + 1}: {lines[insert_idx].rstrip()}")

# Insert the new question before the ],
lines.insert(insert_idx, new_question)

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("完了！")
