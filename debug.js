const track = {
    avgTarget: 95.0,
    volunteeringTarget: 180
};

const studentData = {
    name: "תלמידה",
    subjects: [
        { id: "phys", name: "פיזיקה", questionnaire: "037604", grade: 85, hours: 140 },
        { id: "eng", name: "אנגלית", questionnaire: "016584", grade: 88 },
        { id: "math", name: "מתמטיקה", questionnaire: "035804", grade: 90 },
        { id: "bio", name: "ביולוגיה", questionnaire: "043584", grade: 87 },
        { id: "heb", name: "עברית", questionnaire: "011002", grade: 91 },
        { id: "lit", name: "ספרות", questionnaire: "011003", grade: 96 },
        { id: "cs", name: "מדעי המחשב", questionnaire: "011004", grade: 97 }
    ]
};

const recommendations = [
    {
        totalImprovement: 34,
        newAvg: 95.0,
        subjects: [
            { id: "phys", name: "פיזיקה", questionnaire: "037604", grade: 85, targetGrade: 97 },
            { id: "bio", name: "ביולוגיה", questionnaire: "043584", grade: 87, targetGrade: 99 },
            { id: "math", name: "מתמטיקה", questionnaire: "035804", grade: 90, targetGrade: 100 }
        ]
    },
    {
        totalImprovement: 34,
        newAvg: 95.0,
        subjects: [
            { id: "phys", name: "פיזיקה", questionnaire: "037604", grade: 85, targetGrade: 97 },
            { id: "eng", name: "אנגלית", questionnaire: "016584", grade: 88, targetGrade: 100 },
            { id: "math", name: "מתמטיקה", questionnaire: "035804", grade: 90, targetGrade: 100 }
        ]
    },
    {
        totalImprovement: 34,
        newAvg: 95.0,
        subjects: [
            { id: "phys", name: "פיזיקה", questionnaire: "037604", grade: 85, targetGrade: 98 },
            { id: "eng", name: "אנגלית", questionnaire: "016584", grade: 88, targetGrade: 100 },
            { id: "heb", name: "עברית", questionnaire: "011002", grade: 91, targetGrade: 100 }
        ]
    }
];
