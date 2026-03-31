import MockAdapter from 'axios-mock-adapter';
import { AxiosInstance } from 'axios';

// Mock DB
const USERS: Record<string, any> = {
  'adminabsolute': {
    password: 'absolute2026!',
    user: { id: 'usr_admin', username: 'adminabsolute', email: 'admin@mengo.sc' },
    profile: { id: 'prof_admin', user_id: 'usr_admin', full_name: 'Absolute Admin', profile_pic: null, student_class: null },
    roles: ['adminabsolute'],
  },
  'patron': {
    password: 'patron123',
    user: { id: 'usr_patron', username: 'patron', email: 'patron@mengo.sc' },
    profile: { id: 'prof_patron', user_id: 'usr_patron', full_name: 'School Patron', profile_pic: null, student_class: null },
    roles: ['patron'],
  },
  'chairperson': {
    password: 'chairperson123',
    user: { id: 'usr_chair', username: 'chairperson', email: 'chairperson@mengo.sc' },
    profile: { id: 'prof_chair', user_id: 'usr_chair', full_name: 'Chair Person', profile_pic: null, student_class: 'S.5' },
    roles: ['chairperson'],
  },
  'merecouncillor': {
    password: 'merecouncillor123',
    user: { id: 'usr_councillor', username: 'merecouncillor', email: 'mere@mengo.sc' },
    profile: { id: 'prof_councillor', user_id: 'usr_councillor', full_name: 'Mere Councillor', profile_pic: null, student_class: 'S.3' },
    roles: ['councillor'],
  },
  'publicity': {
    password: 'publicity123',
    user: { id: 'usr_pub', username: 'publicity', email: 'publicity@mengo.sc' },
    profile: { id: 'prof_pub', user_id: 'usr_pub', full_name: 'Secretary Publicity', profile_pic: null, student_class: 'S.4' },
    roles: ['secretary_publicity'],
  }
};

let MOCK_APPLICANTS = [
  { id: '1', applicant_name: 'Jane Doe', class: 'S.2', stream: 'North', smart_score: 9, conf_score: 8, qapp_score: 8, average_score: 25, comment: 'Great prospect', gender: 'female', status: 'qualified' },
  { id: '2', applicant_name: 'John Smith', class: 'S.2', stream: 'South', smart_score: 4, conf_score: 5, qapp_score: 3, average_score: 12, comment: 'Needs confidence', gender: 'male', status: 'disqualified' },
];

export function setupMockApi(api: AxiosInstance) {
  const mock = new MockAdapter(api, { delayResponse: 500 });
  
  mock.onPost('/users/login/').reply((config) => {
    const { username, password } = JSON.parse(config.data);
    const userMock = USERS[username.toLowerCase()];
    if (userMock && userMock.password === password) {
      return [200, {
        access: 'mock-access-token-' + username,
        refresh: 'mock-refresh-token-' + username,
        user: userMock.user,
      }];
    }
    return [401, { detail: "No active account found with the given credentials" }];
  });

  mock.onGet('/users/me/profile/').reply((config) => {
    const token = config.headers?.Authorization;
    if (token) {
      const username = token.split('-').pop();
      if (username && USERS[username]) {
        return [200, USERS[username].profile];
      }
    }
    return [401, {}];
  });

  mock.onPatch('/users/me/profile/').reply((config) => {
    const token = config.headers?.Authorization;
    if (token) {
      const username = token.split('-').pop();
      if (username && USERS[username]) {
        const body = JSON.parse(config.data);
        USERS[username].profile = { ...USERS[username].profile, ...body };
        return [200, USERS[username].profile];
      }
    }
    return [401, {}];
  });

  mock.onGet('/users/me/roles/').reply((config) => {
    const token = config.headers?.Authorization;
    if (token) {
      const username = token.split('-').pop();
      if (username && USERS[username]) {
        return [200, { roles: USERS[username].roles }];
      }
    }
    return [401, {}];
  });

  mock.onPost('/users/register/').reply(() => {
    return [201, { message: "Mock user registered" }];
  });

  // Mock Election Endpoints
  mock.onGet('/applications/').reply(() => {
    return [200, { results: MOCK_APPLICANTS }];
  });

  mock.onPost('/applications/').reply((config) => {
    const body = JSON.parse(config.data);
    const newApp = { ...body, class: body.applicant_class || body.class, id: Date.now().toString(), status: 'pending' };
    MOCK_APPLICANTS.push(newApp);
    return [201, newApp];
  });

  mock.onPatch(/\/applications\/\d+\//).reply((config) => {
    const id = config.url?.split('/')[2];
    const body = JSON.parse(config.data);
    const index = MOCK_APPLICANTS.findIndex(a => a.id === id);
    if (index > -1) {
      MOCK_APPLICANTS[index] = { ...MOCK_APPLICANTS[index], ...body };
      return [200, MOCK_APPLICANTS[index]];
    }
    return [404, {}];
  });

  mock.onDelete(/\/applications\/\d+\//).reply((config) => {
    const id = config.url?.split('/')[2];
    const index = MOCK_APPLICANTS.findIndex(a => a.id === id);
    if (index > -1) {
      MOCK_APPLICANTS.splice(index, 1);
      return [204, {}];
    }
    return [404, {}];
  });

  mock.onPost('/applications/auto-screen/').reply((config) => {
    const { min_average } = JSON.parse(config.data);
    MOCK_APPLICANTS = MOCK_APPLICANTS.map(app => {
      if (app.status === 'pending') {
         return { ...app, status: app.average_score >= min_average ? 'qualified' : 'disqualified' };
      }
      return app;
    });
    return [200, { message: 'Screened' }];
  });

  let MOCK_DOCS: any[] = [
    { id: '100', title: 'Term 1 Report', category: 'Reports', uploaded_by: 'adminabsolute', uploader_role: 'adminabsolute', access_level: 'public', file_url: '#', created_at: new Date().toISOString(), target_office: null },
  ];

  let MOCK_BLOGS: any[] = [
    { id: '1', title: 'Welcome to Mengo Student Hub', content: 'This is the first official blog post regarding our new portal. Watch this space for updates from the Publicity office.', author: 'Publicity Team', media_url: null, media_type: 'none', created_at: new Date().toISOString() }
  ];

  mock.onGet('/blogs/').reply(200, { results: MOCK_BLOGS });
  mock.onPost('/blogs/').reply((config) => {
    const data = JSON.parse(config.data);
    const newBlog = { ...data, id: Date.now().toString(), created_at: new Date().toISOString() };
    MOCK_BLOGS.unshift(newBlog); // Add to beginning
    return [201, newBlog];
  });

  mock.onGet('/documents/').reply((config) => {
    const token = config.headers?.Authorization;
    let userRole = '';
    if (token) {
      const username = token.split('-').pop();
      if (username && USERS[username]) {
        userRole = USERS[username].roles[0];
      }
    }
    
    // Filter docs based on access level
    const visibleDocs = MOCK_DOCS.filter(doc => {
      if (userRole === 'adminabsolute' || userRole === 'patron') return true;
      if (doc.access_level === 'public') return true;
      if (doc.access_level === 'private' && doc.uploader_role === userRole) return true;
      if (doc.access_level === 'shared' && doc.target_office === userRole) return true;
      if (doc.access_level === 'shared' && doc.uploader_role === userRole) return true; // Sender can also see it
      return false;
    });

    return [200, { results: visibleDocs }];
  });

  mock.onPost('/documents/').reply((config) => {
    const token = config.headers?.Authorization;
    let username = 'unknown';
    let userRole = 'councillor';
    if (token) {
      username = token.split('-').pop() || 'unknown';
      if (USERS[username]) userRole = USERS[username].roles[0];
    }
    
    // Parse simulated FormData structure
    const getFormDataValue = (fd: any, key: string) => {
       if (fd && fd.get) return fd.get(key);
       return '';
    };

    const newDoc = {
      id: Date.now().toString(),
      title: getFormDataValue(config.data, 'title') || 'Uploaded Document',
      category: getFormDataValue(config.data, 'category') || 'Other',
      access_level: getFormDataValue(config.data, 'access_level') || 'public',
      target_office: getFormDataValue(config.data, 'target_office') || null,
      uploaded_by: username,
      uploader_role: userRole,
      file_url: '#',
      created_at: new Date().toISOString(),
    };
    MOCK_DOCS.push(newDoc);
    return [201, newDoc];
  });

  // Mock EC Grants
  mock.onGet('/ec-access-grants/').reply(200, { results: [] });

  let MOCK_ELECTION_LOCKS: any[] = [];

  mock.onGet('/election-locks/').reply(200, { results: MOCK_ELECTION_LOCKS });
  mock.onPost('/election-locks/').reply((config) => {
    const data = JSON.parse(config.data);
    const newLock = { ...data, id: Date.now().toString(), created_at: new Date().toISOString() };
    MOCK_ELECTION_LOCKS.push(newLock);
    return [201, newLock];
  });
  mock.onDelete(/\/election-locks\/\d+\//).reply((config) => {
    const id = config.url?.split('/')[2];
    MOCK_ELECTION_LOCKS = MOCK_ELECTION_LOCKS.filter(l => l.id !== id);
    return [204, {}];
  });

  mock.onGet('/users/all-profiles/').reply(200, { results: Object.values(USERS).map(u => u.profile) });

  mock.onPost('/users/upgrade-role/').reply((config) => {
    const { user_id, new_role } = JSON.parse(config.data);
    const userToUpdate = Object.values(USERS).find((u) => u.profile.user_id === user_id);
    if (userToUpdate) {
      userToUpdate.roles = [new_role];
      return [200, { message: "Role upgraded successfully" }];
    }
    return [404, { detail: "User not found" }];
  });

  mock.onAny().passThrough();
}
