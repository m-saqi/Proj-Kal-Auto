from http.server import BaseHTTPRequestHandler
import json
import requests
from bs4 import BeautifulSoup
import random
import urllib3
import re
from urllib.parse import parse_qs, urlparse

# Suppress SSL warnings for UAF legacy servers
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

            if action == 'scrape_attendance':
                self.scrape_attendance(reg_num)
            else:
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
        attnd_status = 'offline'
        try:
            r = requests.head('https://lms.uaf.edu.pk/login/index.php', timeout=3, verify=False)
            if r.status_code < 500: lms_status = 'online'
        except: pass
        
        try:
            r = requests.get('http://121.52.152.24/default.aspx', timeout=3)
            if r.status_code < 500: attnd_status = 'online'
        except: pass

        self.send_json(200, True, 'Status Checked', {'lms_status': lms_status, 'attnd_status': attnd_status})

    def scrape_single(self, reg_num):
        session = requests.Session()
        session.headers.update({'User-Agent': random.choice(USER_AGENTS)})
        
        try:
            # 1. Connect
            resp = session.get('https://lms.uaf.edu.pk/login/index.php', timeout=5, verify=False)
            token = self.extract_token(resp.text)
            if not token:
                raise Exception("Security token not found")

            # 2. Fetch
            payload = {'token': token, 'Register': reg_num}
            res = session.post('https://lms.uaf.edu.pk/course/uaf_student_result.php', data=payload, verify=False)
            
            if "No Result Found" in res.text or "No Records" in res.text:
                self.send_json(404, False, "No results found for this ID")
                return

            data = self.parse_lms_html(res.text, reg_num)
            self.send_json(200, True, "Fetched", {'resultData': data})
        except Exception as e:
            self.send_json(500, False, f"Scraping Error: {str(e)}")

    def scrape_attendance(self, reg_num):
        try:
            url = "http://121.52.152.24/default.aspx"
            s = requests.Session()
            r = s.get(url, timeout=10)
            soup = BeautifulSoup(r.text, 'html.parser')
            
            viewstate = soup.find('input', {'id': '__VIEWSTATE'})['value']
            eventval = soup.find('input', {'id': '__EVENTVALIDATION'})['value']
            
            payload = {
                '__VIEWSTATE': viewstate,
                '__EVENTVALIDATION': eventval,
                'ctl00$Main$txtReg': reg_num,
                'ctl00$Main$btnShow': 'Access To Student Information'
            }
            
            r_post = s.post(url, data=payload, timeout=20)
            data = self.parse_attendance_html(r_post.text)
            
            if not data:
                self.send_json(404, False, "No attendance records found")
            else:
                self.send_json(200, True, "Fetched", {'resultData': data})

        except Exception as e:
            self.send_json(500, False, f"Attendance Error: {str(e)}")

    def extract_token(self, html):
        match = re.search(r"document\.getElementById\('token'\)\.value\s*=\s*'([^']+)'", html)
        if match: return match.group(1)
        soup = BeautifulSoup(html, 'html.parser')
        inp = soup.find('input', {'id': 'token'})
        return inp['value'] if inp else None

    def parse_lms_html(self, html, reg_num):
        soup = BeautifulSoup(html, 'html.parser')
        results = []
        
        # Extract Name Logic
        student_name = "Unknown"
        info_table = soup.find('table')
        if info_table:
            txt = info_table.get_text()
            if "Student Name" in txt:
                parts = [t.strip() for t in txt.splitlines() if t.strip()]
                try:
                    idx = parts.index("Student Name :")
                    student_name = parts[idx+1]
                except: pass

        for table in soup.find_all('table'):
            rows = table.find_all('tr')
            if len(rows) > 1 and 'Semester' in rows[0].get_text():
                for row in rows[1:]:
                    cols = [c.text.strip() for c in row.find_all('td')]
                    if len(cols) >= 12:
                        results.append({
                            'StudentName': student_name,
                            'RegistrationNo': reg_num,
                            'Semester': cols[1],
                            'TeacherName': cols[2],
                            'CourseCode': cols[3],
                            'CourseTitle': cols[4],
                            'CreditHours': cols[5],
                            'Total': cols[10],
                            'Grade': cols[11]
                        })
        return results

    def parse_attendance_html(self, html):
        soup = BeautifulSoup(html, 'html.parser')
        table = soup.find('table', {'id': 'ctl00_Main_TabContainer1_tbResultInformation_gvResultInformation'})
        results = []
        if table:
            for row in table.find_all('tr')[1:]:
                cols = [c.text.strip() for c in row.find_all('td')]
                if len(cols) >= 14:
                    results.append({
                        'Semester': cols[3],
                        'TeacherName': cols[4],
                        'CourseCode': cols[5],
                        'CourseName': cols[6],
                        'Totalmark': cols[12],
                        'Grade': cols[13]
                    })
        return results
