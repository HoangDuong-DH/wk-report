// Verification — sum weight per Bài:
// Bài  1: 4 atomic, sum=4.00, target=4 ✓
// Bài  2: 5 atomic, sum=10.00, target=10 ✓
// Bài  3: 5 atomic, sum=6.00, target=6 ✓
// Bài  4: 5 atomic, sum=6.00, target=6 ✓
// Bài  5: 5 atomic, sum=8.00, target=8 ✓
// Bài  6: 4 atomic, sum=4.00, target=4 ✓
// Bài  7: 5 atomic, sum=4.00, target=4 ✓
// Bài  8: 5 atomic, sum=4.00, target=4 ✓
// Bài  9: 5 atomic, sum=4.00, target=4 ✓
// Bài 10: 5 atomic, sum=4.00, target=4 ✓
// Bài 11: 4 atomic, sum=4.00, target=4 ✓
// Bài 12: 5 atomic, sum=4.00, target=4 ✓
// Bài 13: 4 atomic, sum=20.00, target=20 ✓
// Bài 14: 4 atomic, sum=20.00, target=20 ✓
// TOTAL: 102.00đ across 65 atomic

const __ATOMIC_CRITERIA_L4 = [
  {cau:1, ma:"1.1", label:"Nhận diện được cấu trúc hình khối mẫu", weight:0.8, skill:"attention", skill_xlsx:"Hình học", nhom:"Tư duy cơ bản", bloom:"Nhận biết", difficulty:"Trung bình", support:4},
  {cau:1, ma:"1.2", label:"Vẽ được mặt trước của khối hình", weight:1.2, skill:"attention", skill_xlsx:"Hình học", nhom:"Tư duy cơ bản", bloom:"Ứng dụng", difficulty:"Trung bình", support:4},
  {cau:1, ma:"1.3", label:"Vẽ được mặt bên/mặt trên tạo cảm giác khối 3D", weight:1.2, skill:"attention", skill_xlsx:"Hình học", nhom:"Tư duy cơ bản", bloom:"Ứng dụng", difficulty:"Khó", support:4},
  {cau:1, ma:"1.4", label:"Căn chỉnh kích thước hình phù hợp trong khung", weight:0.8, skill:"attention", skill_xlsx:"Quan sát", nhom:"Tư duy cơ bản", bloom:"Ứng dụng", difficulty:"Trung bình", support:4},
  {cau:2, ma:"2.1", label:"Nhận diện đúng 3 dạng hình: tròn, tam giác, vuông", weight:1.0, skill:"observation", skill_xlsx:"Hình học", nhom:"Tư duy cơ bản", bloom:"Nhận biết", difficulty:"Dễ", support:4},
  {cau:2, ma:"2.2", label:"Nhận diện đúng mặt số 1–10", weight:1.0, skill:"observation", skill_xlsx:"Số & Phép tính", nhom:"Tư duy cơ bản", bloom:"Nhận biết", difficulty:"Dễ", support:4},
  {cau:2, ma:"2.3", label:"Nhận ra quy luật lặp theo thứ tự: tròn – tam giác – vuông", weight:3.0, skill:"observation", skill_xlsx:"Kiểu mẫu & Quy luật", nhom:"Tư duy cơ bản", bloom:"Phân tích", difficulty:"Trung bình", support:4},
  {cau:2, ma:"2.4", label:"Áp dụng quy luật để nối đúng số với hình tương ứng", weight:3.0, skill:"observation", skill_xlsx:"Ứng dụng", nhom:"Tư duy cơ bản", bloom:"Ứng dụng", difficulty:"Trung bình", support:4},
  {cau:2, ma:"2.5", label:"Duy trì và tự điều chỉnh quy luật trong quá trình nối", weight:2.0, skill:"observation", skill_xlsx:"Tập trung", nhom:"Tư duy cơ bản", bloom:"Ứng dụng", difficulty:"Trung bình", support:4},
  {cau:3, ma:"3.1", label:"Tập trung nghe chuỗi số được đọc", weight:1.2, skill:"memory", skill_xlsx:"Tập trung", nhom:"Tư duy cơ bản", bloom:"Hiểu", difficulty:"Trung bình", support:4},
  {cau:3, ma:"3.2", label:"Ghi nhớ chuỗi số theo đúng thứ tự nghe được", weight:1.2, skill:"memory", skill_xlsx:"Ghi nhớ", nhom:"Tư duy cơ bản", bloom:"Ứng dụng", difficulty:"Trung bình", support:4},
  {cau:3, ma:"3.3", label:"Viết lại chuỗi số theo đúng thứ tự xuôi", weight:1.2, skill:"memory", skill_xlsx:"Số & Phép tính", nhom:"Tư duy cơ bản", bloom:"Ứng dụng", difficulty:"Trung bình", support:4},
  {cau:3, ma:"3.4", label:"Viết lại chuỗi số theo thứ tự đảo ngược", weight:1.2, skill:"memory", skill_xlsx:"Số & Phép tính", nhom:"Tư duy cơ bản", bloom:"Phân tích", difficulty:"Khó", support:2},
  {cau:3, ma:"3.5", label:"Thể hiện chữ số rõ ràng, đúng vị trí dòng yêu cầu", weight:1.2, skill:"memory", skill_xlsx:"Ứng dụng", nhom:"Tư duy cơ bản", bloom:"Ứng dụng", difficulty:"Trung bình", support:4},
  {cau:4, ma:"4.1", label:"Quan sát và nhận diện đặc điểm của từng cặp thẻ", weight:0.6, skill:"understanding", skill_xlsx:"Quan sát", nhom:"Tư duy logic", bloom:"Nhận biết", difficulty:"Trung bình", support:1},
  {cau:4, ma:"4.2", label:"So sánh đúng tiêu chí kích thước giữa hai thẻ", weight:1.2, skill:"understanding", skill_xlsx:"Đo lường", nhom:"Tư duy logic", bloom:"Phân tích", difficulty:"Trung bình", support:1},
  {cau:4, ma:"4.3", label:"So sánh đúng tiêu chí hình dạng giữa hai thẻ", weight:1.2, skill:"understanding", skill_xlsx:"Hình học", nhom:"Tư duy logic", bloom:"Phân tích", difficulty:"Trung bình", support:1},
  {cau:4, ma:"4.4", label:"So sánh đúng tiêu chí số lượng giữa hai thẻ", weight:1.2, skill:"understanding", skill_xlsx:"Số & Phép tính", nhom:"Tư duy logic", bloom:"Phân tích", difficulty:"Trung bình", support:1},
  {cau:4, ma:"4.5", label:"Đánh dấu đúng tiêu chí giống/khác theo yêu cầu", weight:1.8, skill:"understanding", skill_xlsx:"Phân tích", nhom:"Tư duy logic", bloom:"Ứng dụng", difficulty:"Khó", support:1},
  {cau:5, ma:"5.1", label:"Nhận diện đặc điểm chung của nhóm hình bên trái", weight:1.6, skill:"application", skill_xlsx:"Quan sát", nhom:"Tư duy logic", bloom:"Nhận biết", difficulty:"Trung bình", support:1},
  {cau:5, ma:"5.2", label:"Chọn đúng hình bên phải phù hợp với nhóm bên trái", weight:2.4, skill:"application", skill_xlsx:"Dữ liệu", nhom:"Tư duy logic", bloom:"Ứng dụng", difficulty:"Trung bình", support:1},
  {cau:5, ma:"5.3", label:"Loại trừ các hình không cùng nhóm", weight:0.8, skill:"application", skill_xlsx:"Ứng dụng", nhom:"Tư duy logic", bloom:"Phân tích", difficulty:"Khó", support:1},
  {cau:5, ma:"5.4", label:"Giải thích được lý do chọn hình khi giáo viên hỏi", weight:1.6, skill:"application", skill_xlsx:"Phân tích", nhom:"Tư duy logic", bloom:"Phân tích", difficulty:"Khó", support:1},
  {cau:5, ma:"5.5", label:"Linh hoạt đưa ra hoặc chấp nhận cách phân loại khác có cơ sở hợp lý", weight:1.6, skill:"application", skill_xlsx:"Phân tích", nhom:"Tư duy logic", bloom:"Sáng tạo", difficulty:"Khó", support:1},
  {cau:6, ma:"6.1", label:"Nhận diện các phần/mảng màu và vị trí trong từng bộ mảnh", weight:0.8, skill:"analysis", skill_xlsx:"Hình học", nhom:"Tư duy logic", bloom:"Nhận biết", difficulty:"Trung bình", support:0},
  {cau:6, ma:"6.2", label:"Đối chiếu bộ mảnh với hình hoàn chỉnh ở hàng dưới", weight:1.2, skill:"analysis", skill_xlsx:"Hình học", nhom:"Tư duy logic", bloom:"Ứng dụng", difficulty:"Khó", support:0},
  {cau:6, ma:"6.3", label:"Nối đúng bộ mảnh với hình có thể tạo thành", weight:1.6, skill:"analysis", skill_xlsx:"Ứng dụng", nhom:"Tư duy logic", bloom:"Ứng dụng", difficulty:"Khó", support:0},
  {cau:6, ma:"6.4", label:"Loại trừ hoặc tự điều chỉnh khi phát hiện hình không phù hợp", weight:0.4, skill:"analysis", skill_xlsx:"Phân tích", nhom:"Tư duy logic", bloom:"Phân tích", difficulty:"Khó", support:0},
  {cau:7, ma:"7.1", label:"Nhận diện đúng các đối tượng trong câu lệnh: chai, táo, cá, cà rốt, trứng, bắp cải", weight:0.4, skill:"synthesis", skill_xlsx:"Quan sát", nhom:"Tư duy logic", bloom:"Nhận biết", difficulty:"Dễ", support:4},
  {cau:7, ma:"7.2", label:"Hiểu quan hệ vị trí “bên trái/phía trên/ở giữa/bên cạnh”", weight:0.8, skill:"synthesis", skill_xlsx:"Hình học", nhom:"Tư duy logic", bloom:"Hiểu", difficulty:"Trung bình", support:4},
  {cau:7, ma:"7.3", label:"Xác định đúng vật mốc trong từng mệnh lệnh", weight:0.8, skill:"synthesis", skill_xlsx:"Hiểu", nhom:"Tư duy logic", bloom:"Phân tích", difficulty:"Khó", support:4},
  {cau:7, ma:"7.4", label:"Nối đúng hình theo từng mệnh lệnh vị trí", weight:1.2, skill:"synthesis", skill_xlsx:"Ứng dụng", nhom:"Tư duy logic", bloom:"Ứng dụng", difficulty:"Khó", support:4},
  {cau:7, ma:"7.5", label:"Xử lý đồng thời nhiều quan hệ vị trí trong cùng một hình", weight:0.8, skill:"synthesis", skill_xlsx:"Tổng hợp", nhom:"Tư duy logic", bloom:"Phân tích", difficulty:"Khó", support:4},
  {cau:8, ma:"8.1", label:"Nhận diện đúng các chữ số trên thẻ", weight:0.4, skill:"number", skill_xlsx:"Số & Phép tính", nhom:"Tư duy toán học", bloom:"Nhận biết", difficulty:"Dễ", support:4},
  {cau:8, ma:"8.2", label:"Hiểu yêu cầu nối hai thẻ để tạo tổng bằng 10 nghĩa là phép cộng", weight:0.8, skill:"number", skill_xlsx:"Số & Phép tính", nhom:"Tư duy toán học", bloom:"Hiểu", difficulty:"Trung bình", support:4},
  {cau:8, ma:"8.3", label:"Tìm đúng các cặp số có tổng bằng 10", weight:1.2, skill:"number", skill_xlsx:"Số & Phép tính", nhom:"Tư duy toán học", bloom:"Ứng dụng", difficulty:"Khó", support:4},
  {cau:8, ma:"8.4", label:"Nối đúng thẻ hàng trên với thẻ hàng dưới", weight:0.8, skill:"number", skill_xlsx:"Ứng dụng", nhom:"Tư duy toán học", bloom:"Ứng dụng", difficulty:"Trung bình", support:4},
  {cau:8, ma:"8.5", label:"Kiểm tra và điều chỉnh cặp ghép nếu sai", weight:0.8, skill:"number", skill_xlsx:"Phân tích", nhom:"Tư duy toán học", bloom:"Phân tích", difficulty:"Khó", support:4},
  {cau:9, ma:"9.1", label:"Quan sát đúng các khối/mảnh ở hàng trên", weight:0.4, skill:"geometry", skill_xlsx:"Quan sát", nhom:"Tư duy toán học", bloom:"Nhận biết", difficulty:"Trung bình", support:4},
  {cau:9, ma:"9.2", label:"Nhận diện hình dạng, màu sắc và số lượng khối trong mỗi bộ", weight:0.8, skill:"geometry", skill_xlsx:"Hình học", nhom:"Tư duy toán học", bloom:"Nhận biết", difficulty:"Trung bình", support:4},
  {cau:9, ma:"9.3", label:"Đối chiếu bộ khối với công trình có thể xây dựng ở hàng dưới", weight:1.2, skill:"geometry", skill_xlsx:"Hình học", nhom:"Tư duy toán học", bloom:"Ứng dụng", difficulty:"Khó", support:4},
  {cau:9, ma:"9.4", label:"Nối đúng bộ khối với hình công trình tương ứng", weight:1.2, skill:"geometry", skill_xlsx:"Ứng dụng", nhom:"Tư duy toán học", bloom:"Ứng dụng", difficulty:"Khó", support:4},
  {cau:9, ma:"9.5", label:"Loại trừ công trình không phù hợp vì thiếu/sai khối", weight:0.4, skill:"geometry", skill_xlsx:"Phân tích", nhom:"Tư duy toán học", bloom:"Phân tích", difficulty:"Khó", support:4},
  {cau:10, ma:"10.1", label:"Nhận diện các chìa khóa có độ dài khác nhau", weight:0.4, skill:"measurement", skill_xlsx:"Quan sát", nhom:"Tư duy toán học", bloom:"Nhận biết", difficulty:"Dễ", support:4},
  {cau:10, ma:"10.2", label:"So sánh độ dài giữa các chìa khóa", weight:0.8, skill:"measurement", skill_xlsx:"Đo lường", nhom:"Tư duy toán học", bloom:"Phân tích", difficulty:"Trung bình", support:4},
  {cau:10, ma:"10.3", label:"Xác định đúng chìa khóa dài nhất và ngắn nhất", weight:0.8, skill:"measurement", skill_xlsx:"Đo lường", nhom:"Tư duy toán học", bloom:"Phân tích", difficulty:"Trung bình", support:4},
  {cau:10, ma:"10.4", label:"Sắp xếp đúng thứ tự từ dài nhất đến ngắn nhất", weight:1.2, skill:"measurement", skill_xlsx:"Tổng hợp", nhom:"Tư duy toán học", bloom:"Ứng dụng", difficulty:"Khó", support:4},
  {cau:10, ma:"10.5", label:"Điền đúng số 1–4 vào từng chìa khóa theo thứ tự yêu cầu", weight:0.8, skill:"measurement", skill_xlsx:"Ứng dụng", nhom:"Tư duy toán học", bloom:"Ứng dụng", difficulty:"Trung bình", support:2},
  {cau:11, ma:"11.1", label:"Quan sát và nhận diện dãy số trong từng hàng", weight:0.8, skill:"pattern", skill_xlsx:"Quan sát", nhom:"Tư duy toán học", bloom:"Nhận biết", difficulty:"Trung bình", support:4},
  {cau:11, ma:"11.2", label:"Nhận diện được kiểu mẫu/quy luật của từng nhóm số trong hàng", weight:1.2, skill:"pattern", skill_xlsx:"Kiểu mẫu & Quy luật", nhom:"Tư duy toán học", bloom:"Phân tích", difficulty:"Khó", support:4},
  {cau:11, ma:"11.3", label:"Chọn/khoanh đúng số tiếp theo theo quy luật", weight:1.2, skill:"pattern", skill_xlsx:"Ứng dụng", nhom:"Tư duy toán học", bloom:"Ứng dụng", difficulty:"Khó", support:4},
  {cau:11, ma:"11.4", label:"Giải thích/kiểm tra được vì sao đáp án phù hợp", weight:0.8, skill:"pattern", skill_xlsx:"Phân tích", nhom:"Tư duy toán học", bloom:"Phân tích", difficulty:"Khó", support:4},
  {cau:12, ma:"12.1", label:"Nhận diện đúng từng loại món ăn: kem, kẹo, burger, nho", weight:0.4, skill:"data", skill_xlsx:"Quan sát", nhom:"Tư duy toán học", bloom:"Nhận biết", difficulty:"Dễ", support:4},
  {cau:12, ma:"12.2", label:"Đếm đúng số lượng từng loại món ăn", weight:0.8, skill:"data", skill_xlsx:"Số & Phép tính", nhom:"Tư duy toán học", bloom:"Ứng dụng", difficulty:"Trung bình", support:4},
  {cau:12, ma:"12.3", label:"Biểu diễn số lượng bằng số vòng tròn tương ứng trên biểu đồ", weight:1.2, skill:"data", skill_xlsx:"Dữ liệu", nhom:"Tư duy toán học", bloom:"Ứng dụng", difficulty:"Khó", support:2},
  {cau:12, ma:"12.4", label:"So sánh số lượng giữa các nhóm món ăn", weight:0.8, skill:"data", skill_xlsx:"Phân tích", nhom:"Tư duy toán học", bloom:"Phân tích", difficulty:"Khó", support:2},
  {cau:12, ma:"12.5", label:"Đánh số thứ tự 1–4 theo mức độ yêu thích giảm dần/số lượng giảm dần", weight:0.8, skill:"data", skill_xlsx:"Ứng dụng", nhom:"Tư duy toán học", bloom:"Phân tích", difficulty:"Khó", support:2},
  {cau:13, ma:"13.1", label:"TRÔI CHẢY: Số ô vẽ thành hình", weight:5.0, skill:"fluency", skill_xlsx:"Trôi chảy", nhom:"Tư duy sáng tạo", bloom:"Sáng tạo", difficulty:"Khó", support:4},
  {cau:13, ma:"13.2", label:"LINH HOẠT: Số nhóm chủ đề", weight:5.0, skill:"flexibility", skill_xlsx:"Linh hoạt", nhom:"Tư duy sáng tạo", bloom:"Sáng tạo", difficulty:"Khó", support:4},
  {cau:13, ma:"13.3", label:"ĐỘC ĐÁO: Ý lạ ngoài DS phổ biến", weight:5.0, skill:"originality", skill_xlsx:"Độc đáo", nhom:"Tư duy sáng tạo", bloom:"Sáng tạo", difficulty:"Khó", support:4},
  {cau:13, ma:"13.4", label:"CHÍNH XÁC: Sử dụng nét gốc làm một phần có nghĩa của hình vẽ", weight:5.0, skill:"precision", skill_xlsx:"Chính xác", nhom:"Tư duy sáng tạo", bloom:"Sáng tạo", difficulty:"Khó", support:4},
  {cau:14, ma:"14.1", label:"TRÔI CHẢY: Số ô vẽ thành hình", weight:5.0, skill:"fluency", skill_xlsx:"Trôi chảy", nhom:"Tư duy sáng tạo", bloom:"Sáng tạo", difficulty:"Khó", support:4},
  {cau:14, ma:"14.2", label:"LINH HOẠT: Số nhóm chủ đề", weight:5.0, skill:"flexibility", skill_xlsx:"Linh hoạt", nhom:"Tư duy sáng tạo", bloom:"Sáng tạo", difficulty:"Khó", support:4},
  {cau:14, ma:"14.3", label:"ĐỘC ĐÁO: Ý lạ ngoài DS phổ biến", weight:5.0, skill:"originality", skill_xlsx:"Độc đáo", nhom:"Tư duy sáng tạo", bloom:"Sáng tạo", difficulty:"Khó", support:4},
  {cau:14, ma:"14.4", label:"CHÍNH XÁC: Sử dụng nét gốc làm một phần có nghĩa của hình vẽ", weight:5.0, skill:"precision", skill_xlsx:"Chính xác", nhom:"Tư duy sáng tạo", bloom:"Sáng tạo", difficulty:"Khó", support:4},
];
