from http.server import BaseHTTPRequestHandler
import json
import requests
from bs4 import BeautifulSoup
import random
import urllib3
import re
from urllib.parse import parse_qs, urlparse

# Suppress SSL warnings (Required for UAF's older server config)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
]

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        self.handle_request()

    def do_GET(self):
        self.handle_request()

    def handle_request(self):
        try:
            # Parse Query/Body
            if self.command == 'GET':
                query = parse_qs(urlparse(self.path).query)
                action = query.get('action', [''])[0]
                reg_num = query.get('registrationNumber', [''])[0]
            else:
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length).decode('utf-8')
                data = json.loads(body) if body else {}
                query = parse_qs(urlparse(self.path).query)
                action = query.get('action', [''])[0]
                reg_num = data.get('registrationNumber')

            if action == 'check_status':
                self.check_status()
                return
            
            if not reg_num:
                self.send_json(400, False, 'Registration number is required')
                return

            # Default to single result scrape
            self.scrape_single(reg_num)

        except Exception as e:
            self.send_json(500, False, str(e))

    def send_json(self, status, success, message, data=None):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        resp = {'success': success, 'message': message}
        if data is not None: resp.update(data)
        self.wfile.write(json.dumps(resp).encode())

    def check_status(self):
        lms_status = 'offline'
        try:
            r = requests.head('https://lms.uaf.edu.pk/login/index.php', timeout=3, verify=False)
            if r.status_code < 500: lms_status = 'online'
        except: pass
        self.send_json(200, True, 'Status Checked', {'lms_status': lms_status})

    def scrape_single(self, reg_num):
        session = requests.Session()
        session.headers.update({'User-Agent': random.choice(USER_AGENTS)})
        
        try:
            # 1. Connect & Get Token
            resp = session.get('https://lms.uaf.edu.pk/login/index.php', timeout=8, verify=False)
            token = self.extract_token(resp.text)
            if not token:
                raise Exception("Could not retrieve security token from LMS")

            # 2. Fetch Result
            payload = {'token': token, 'Register': reg_num}
            res = session.post('https://lms.uaf.edu.pk/course/uaf_student_result.php', data=payload, verify=False, timeout=15)
            
            if "No Result Found" in res.text or "No Records" in res.text:
                self.send_json(404, False, "No results found for this ID")
                return

            data = self.parse_lms_html(res.text, reg_num)
            self.send_json(200, True, "Fetched", {'resultData': data})
        except Exception as e:
            self.send_json(500, False, f"LMS Connection Error: {str(e)}")

    def extract_token(self, html):
        match = re.search(r"document\.getElementById\('token'\)\.value\s*=\s*'([^']+)'", html)
        if match: return match.group(1)
        soup = BeautifulSoup(html, 'html.parser')
        inp = soup.find('input', {'id': 'token'})
        return inp['value'] if inp else None

    def parse_lms_html(self, html, reg_num):
        soup = BeautifulSoup(html, 'html.parser')
        results = []
        
        # Extract Student Name dynamically
        student_name = "Unknown"
        # Try to find name in the first visible table or text block
        for bold in soup.find_all('b'):
            if "Student Name" in bold.text:
                student_name = bold.next_sibling.strip() if bold.next_sibling else "Student"
                break
        
        # Robust Table Parsing
        for table in soup.find_all('table'):
            rows = table.find_all('tr')
            if not rows: continue
            
            # Check if this is a result table by looking for headers
            header_text = rows[0].get_text().lower()
            if 'semester' in header_text and 'course' in header_text:
                for row in rows[1:]:
                    cols = [c.text.strip() for c in row.find_all('td')]
                    # Ensure we have enough columns before accessing index
                    if len(cols) >= 10: 
                        # Map columns dynamically if possible, otherwise use standard indices
                        # Standard UAF Result Table: 
                        # 0:Sr, 1:Sem, 2:Teacher, 3:Code, 4:Title, 5:CH, ..., 10:Total, 11:Grade
                        results.append({
                            'StudentName': student_name.replace(":", "").strip(),
                            'RegistrationNo': reg_num,
                            'Semester': cols[1],
                            'TeacherName': cols[2],
                            'CourseCode': cols[3],
                            'CourseTitle': cols[4],
                            'CreditHours': cols[5],
                            'Total': cols[10] if len(cols) > 10 else "0",
                            'Grade': cols[11] if len(cols) > 11 else ""
                        })
        return results
