# Mau giao atomic input template

File CSV di kem: `mau-giao-atomic-input-template.csv`

Muc tieu: tach vung nhap lieu tho khoi bao cao. Giao vien chi cham cot `Level_0_5`; he thong tu tinh `EarnedScore` va tong hop thanh bao cao.

## Nguyen tac cham

- `Level_0_5` la cot nhap duy nhat cua giao vien cho moi tieu chi.
- Gia tri hop le: `0`, `1`, `2`, `3`, `4`, `5`.
- Khong tu xem o trong la `0`. O trong nghia la `Missing`.
- `EarnedScore` duoc tinh tu dong:

```text
EarnedScore = Weight * Level_0_5 / 5
```

Vi du:

```text
Weight = 2
Level_0_5 = 4
EarnedScore = 1.6
```

## Cot trong CSV

| Cot | Ai nhap | Y nghia |
|---|---|---|
| StudentName | Admin/GV | Ten hoc sinh |
| Class | Admin/GV | Lop/chuong trinh |
| BirthYear | Admin/GV | Nam sinh |
| TestName | Admin/GV | Ten bai test |
| TestDate | Admin/GV | Ngay danh gia |
| Question | Admin | So cau |
| Code | Admin | Ma tieu chi atomic, vi du `1.1` |
| AtomicCriterion | Admin | Tieu chi quan sat/cham diem |
| Weight | Admin | Trong so diem toi da cua tieu chi |
| Level_0_5 | GV | Muc cham 0-5 |
| EarnedScore | Formula | Diem dat sau quy doi trong so |
| MeasuredSkill | Admin | Nang luc do, co the co nhieu nang luc cach nhau bang `/` |
| SkillSplitPolicy | Admin | `single` hoac `split` |
| UnitAE | Admin | Don vi A-E |
| AbstractLevel | Admin | `Truc quan cu the`, `Truu tuong co goi y`, `Truu tuong cao` |
| Channel | Admin | `Truc quan` hoac `Nghe-hieu` |
| BloomLevel | Admin | `De`, `Trung binh`, `Kho` |
| SupportLevel | Admin | Muc ho tro/ngu canh lam bai |
| TeacherNote | GV | Ghi chu neu can |
| Status | Formula | `Missing` hoac `OK` |

## Quy tac tong hop

Tong theo cau:

```text
QuestionScore = sum(EarnedScore theo Question)
QuestionMax = sum(Weight theo Question)
QuestionPct = QuestionScore / QuestionMax
```

Tong theo nang luc:

```text
SkillScore = sum(EarnedScore phan bo vao skill)
SkillMax = sum(Weight phan bo vao skill)
SkillPct = SkillScore / SkillMax
```

Neu `MeasuredSkill` co nhieu nang luc va `SkillSplitPolicy = split`, diem va trong so duoc chia deu cho tung nang luc. Vi du:

```text
MeasuredSkill = Kien nhan/Quan sat
Weight = 1
EarnedScore = 0.8

Kien nhan nhan: max 0.5, score 0.4
Quan sat nhan: max 0.5, score 0.4
```

Tong theo A-E, Bloom, Channel, AbstractLevel:

```text
GroupScore = sum(EarnedScore theo group)
GroupMax = sum(Weight theo group)
GroupPct = GroupScore / GroupMax
```

## Khuyen nghi UX cho giao vien

- Sheet/app cham diem chi nen hien: `Question`, `Code`, `AtomicCriterion`, `MeasuredSkill`, `Weight`, `Level_0_5`, `TeacherNote`.
- An `EarnedScore` khoi man hinh cham chinh de tranh roi.
- Bat buoc canh bao neu con dong `Missing` truoc khi xuat bao cao.
- Nen dung dropdown/segmented control 0-5 thay vi o nhap tu do.
