class ExamScheduler {
    constructor() {
        this.examInput = document.getElementById('examInput');
        this.generateBtn = document.getElementById('generateBtn');
        this.errorDiv = document.getElementById('error');
        this.scheduleDiv = document.getElementById('schedule');
        this.scheduleContent = document.getElementById('scheduleContent');

        this.generateBtn.addEventListener('click', () => this.generateSchedule());
    }

    colorGraph(graph) {
        const subjects = Array.from(graph.keys());
        const numColors = subjects.length; // Maximum possible time slots needed

        const isColorSafe = (subject, color) => {
            const node = graph.get(subject);
            if (!node) return false;

            for (const conflict of node.conflicts) {
                const conflictNode = graph.get(conflict);
                if (conflictNode && conflictNode.color === color) {
                    return false;
                }
            }
            return true;
        };

        const colorSubjectsUtil = (subjectIndex) => {
            if (subjectIndex === subjects.length) return true;

            const currentSubject = subjects[subjectIndex];
            const node = graph.get(currentSubject);
            if (!node) return false;

            for (let color = 0; color < numColors; color++) {
                if (isColorSafe(currentSubject, color)) {
                    node.color = color;
                    if (colorSubjectsUtil(subjectIndex + 1)) return true;
                    node.color = -1;
                }
            }
            return false;
        };

        return colorSubjectsUtil(0);
    }

    showError(message) {
        this.errorDiv.textContent = message;
        this.errorDiv.classList.remove('hidden');
        this.scheduleDiv.classList.add('hidden');
    }

    hideError() {
        this.errorDiv.classList.add('hidden');
    }

    generateSchedule() {
        try {
            this.hideError();
            const lines = this.examInput.value.trim().split('\n');
            const graph = new Map();

            // Build the graph
            for (const line of lines) {
                const [subject1, subject2] = line.split(',').map(s => s.trim());
                if (!subject1 || !subject2) {
                    throw new Error('Invalid input format');
                }

                if (!graph.has(subject1)) {
                    graph.set(subject1, { subject: subject1, color: -1, conflicts: [] });
                }
                if (!graph.has(subject2)) {
                    graph.set(subject2, { subject: subject2, color: -1, conflicts: [] });
                }

                graph.get(subject1).conflicts.push(subject2);
                graph.get(subject2).conflicts.push(subject1);
            }

            // Apply graph coloring
            if (!this.colorGraph(graph)) {
                this.showError('Unable to generate a valid schedule. Please check conflicts.');
                return;
            }

            // Generate schedule from colored graph
            const schedule = new Map();
            for (const [subject, node] of graph.entries()) {
                const timeSlot = node.color;
                if (!schedule.has(timeSlot)) {
                    schedule.set(timeSlot, []);
                }
                schedule.get(timeSlot).push(subject);
            }

            this.displaySchedule(schedule);
        } catch (err) {
            this.showError('Error processing input. Please check the format.');
        }
    }

    displaySchedule(schedule) {
        this.scheduleContent.innerHTML = '';
        this.scheduleDiv.classList.remove('hidden');

        Array.from(schedule.entries()).forEach(([timeSlot, subjects]) => {
            const timeSlotDiv = document.createElement('div');
            timeSlotDiv.className = 'time-slot';
            timeSlotDiv.innerHTML = `
                <h3>Time Slot ${timeSlot + 1}</h3>
                <div class="subjects">${subjects.join(', ')}</div>
            `;
            this.scheduleContent.appendChild(timeSlotDiv);
        });
    }
}

// Initialize the scheduler when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ExamScheduler();
});