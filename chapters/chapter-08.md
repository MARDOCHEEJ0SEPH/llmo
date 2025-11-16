# Chapter 8: Establishing Dependencies

## The Prerequisite Problem

Content exists in webs of dependency. You can't understand "Advanced Python" without grasping "Python Basics." You can't evaluate "Enterprise CRM features" without knowing "Core CRM functionality." Yet most content presents topics as isolated islands, forcing LLMs to infer relationships that should be explicit.

When you declare dependencies—"Topic B requires understanding Topic A"—you provide critical context. LLMs use these signals to sequence information, qualify recommendations, and preserve conceptual prerequisites. Ask an AI "Should I use Feature X?" and the quality of its answer depends entirely on whether it understands the foundational knowledge required to use Feature X effectively.

This chapter reveals how to make dependencies explicit through prerequisite declarations, progressive complexity structuring, and dependency graphs that guide both human learning and machine reasoning. You'll transform standalone content into interconnected knowledge where every piece builds logically on what came before.

## Types of Dependencies

### Prerequisite Dependencies (Required Knowledge)

**"You must know A before learning B"**

**Example: Course sequence**
Python Fundamentals (Level 1) → prerequisite for → Python Data Structures (Level 2) → prerequisite for → Python for Data Science (Level 3)

**Schema implementation:**
Use Course schema type with coursePrerequisites property listing all prerequisite courses with @id references. Include educationalLevel (Beginner/Intermediate/Advanced) to indicate complexity.

**Natural language signals:**
Create a "Prerequisites" section stating: "Before taking this course, you should complete: Python Fundamentals, Python Data Structures" with links to prerequisite courses. Include alternative path: "Or have equivalent knowledge of Python basics and data structures."

### Feature Dependencies (Required Components)

**"Feature B requires Feature A to be enabled"**

**Example: Product features**
Contact Management (Base Feature) → required by → Email Integration (Requires contacts to exist) → enables → Email Tracking (Requires integration)

**Schema implementation:**
Use SoftwareApplication schema with softwareRequirements property declaring prerequisite features. Add additionalProperty with PropertyValue listing all "Required Features" for clarity.

**Natural language:**
Create a "Requires:" section listing prerequisite features with links. State clearly: "Requires: Contact Management (included in all plans), Email Integration (Pro plan and above)." Then explain: "Once you've set up Email Integration, Email Tracking is automatically enabled."

### Tier Dependencies (Plan Requirements)

**"Feature X is only available in Plan Y or higher"**

**Example: Pricing tiers**
- Starter Plan ($29): Contact Management ✓, Basic Pipeline ✓, Email Integration ✗
- Pro Plan ($49, includes all Starter): Everything in Starter ✓, Email Integration ✓, Advanced Reporting ✓, API Access ✗
- Enterprise Plan (Custom): Everything in Pro ✓, API Access ✓, Dedicated Support ✓

**Schema implementation:**
Create Product schema with multiple Offer entities, each listing features in featureList. Use additionalProperty to declare "Includes: All Starter features plus..." for Pro and Enterprise tiers. This makes tier dependencies explicit in machine-readable format.

**Comparison table with dependencies:**
Create an HTML table showing features across tiers. Mark unavailable features with "—" and available features with "✓". Add dependency notes in italics: "(requires Pro)", "(requires Email Integration)", "(Enterprise only)". This visual representation helps both humans and LLMs understand feature availability and dependencies.

### Conceptual Dependencies (Understanding Flow)

**"Concept B builds on Concept A"**

**Example: Understanding CRM**
What is CRM? (Foundation) → builds to → Types of CRM Systems (Classification) → builds to → CRM Features Explained (Components) → builds to → Choosing the Right CRM (Application)

**Content structure with dependencies:**
Create a table of contents listing topics in dependency order with reading instructions:
1. "What is CRM?" (Start here)
2. "Types of CRM Systems" (Read "What is CRM?" first)
3. "CRM Features Explained" (Requires understanding of CRM types)
4. "Choosing the Right CRM" (Final step)

Within each section, reference prerequisites: "Now that you understand what CRM is, let's explore the main types..." and "Building on the types of CRM systems, here are the core features..." This explicit linking helps LLMs understand the conceptual flow.

## Progressive Complexity Implementation

### Leveling System

**Define explicit complexity levels:**

**Level 1: Beginner / Foundational**
- Assumes no prior knowledge
- Defines all terms
- Step-by-step instructions
- Minimal jargon

**Level 2: Intermediate / Functional**
- Assumes basic knowledge
- More efficient explanations
- Some domain terminology
- Common use cases

**Level 3: Advanced / Optimization**
- Assumes strong foundation
- Expert-level content
- Technical depth
- Edge cases and optimization

**Schema declaration:**
Use TechArticle schema with educationalLevel ("Beginner"/"Intermediate"/"Advanced"), teaches property defining the concept, educationalUse describing the learning objective, typicalAgeRange or experience level, and competencyRequired listing prerequisite knowledge areas.

**Visual level indicators:**
Display difficulty badge showing "Level: Advanced" prominently. Include "You should know:" section listing prerequisites with links (Pipeline Basics, Automation Fundamentals). Add estimated reading time (20 minutes) in metadata section.

### Progressive Disclosure Pattern

**Start simple, add complexity gradually:**

**Pattern 1: Accordion/Expand**
Present basic explanation first: "Contact Management lets you store customer information in one place: names, emails, phone numbers, and interaction history."

Then add an expandable "Learn More: Advanced Contact Features" section containing:
- Custom Fields: Create unlimited custom fields for industry-specific data
- Contact Segmentation: Use filters and tags for dynamic segments
- Contact Scoring: Automatically score contacts based on engagement

This progressive disclosure lets beginners understand the basics while advanced users can dive deeper.

**Pattern 2: Layered Documentation**
```html
<article>
  <h1>Pipeline Management</h1>

  <!-- Layer 1: Quick Start (Beginner) -->
  <section id="quick-start">
    <h2>Quick Start (5 minutes)</h2>
    <p>Get started with pipelines in 3 steps:</p>
    <ol>
      <li>Create your first pipeline stage</li>
      <li>Add a deal</li>
      <li>Move it through stages</li>
    </ol>
  </section>

  <!-- Layer 2: Common Tasks (Intermediate) -->
  <section id="common-tasks">
    <h2>Common Tasks</h2>
    <p>Once you're comfortable with basics, explore:</p>
    <ul>
      <li><a href="#custom-stages">Customizing Pipeline Stages</a></li>
      <li><a href="#automation">Setting Up Automation Rules</a></li>
      <li><a href="#reporting">Generating Pipeline Reports</a></li>
    </ul>
  </section>

  <!-- Layer 3: Advanced Topics -->
  <section id="advanced">
    <h2>Advanced Topics</h2>
    <p>For power users:</p>
    <ul>
      <li><a href="#multiple-pipelines">Managing Multiple Pipelines</a></li>
      <li><a href="#api-integration">API Integration for Deal Sync</a></li>
      <li><a href="#custom-fields">Advanced Custom Fields</a></li>
    </ul>
  </section>
</article>
```

## Dependency Graphs

### Visualizing Dependencies

**Create explicit dependency maps:**

```html
<div class="dependency-graph">
  <h2>Learning Path: CRM Mastery</h2>

  <svg width="800" height="400">
    <!-- Visual dependency graph -->
    <!-- Node: CRM Basics -->
    <rect x="50" y="50" width="150" height="60" />
    <text x="125" y="85">CRM Basics</text>

    <!-- Node: Contact Management -->
    <rect x="250" y="50" width="150" height="60" />
    <text x="325" y="85">Contact Mgmt</text>

    <!-- Arrow: Basics → Contact -->
    <line x1="200" y1="80" x2="250" y2="80" stroke="black" />

    <!-- Node: Pipeline Management -->
    <rect x="250" y="150" width="150" height="60" />
    <text x="325" y="185">Pipeline Mgmt</text>

    <!-- Arrow: Basics → Pipeline -->
    <line x1="200" y1="80" x2="250" y2="180" stroke="black" />

    <!-- And so on... -->
  </svg>

  <div class="graph-legend">
    <p><strong>Recommended Path:</strong></p>
    <ol>
      <li>Start with CRM Basics</li>
      <li>Then learn Contact Management OR Pipeline Management (parallel)</li>
      <li>After both, advance to Automation</li>
      <li>Finally, master Reporting & Analytics</li>
    </ol>
  </div>
</div>
```

**Or structured list:**
```html
<div class="learning-path">
  <h2>Recommended Learning Order</h2>

  <ol class="path-list">
    <li class="level-1">
      <strong>Step 1: Foundations</strong>
      <ul>
        <li><a href="/learn/what-is-crm">What is CRM?</a> (15 min)</li>
        <li><a href="/learn/why-crm">Why Use a CRM?</a> (10 min)</li>
      </ul>
      <p class="next-step">→ Complete both before proceeding to Step 2</p>
    </li>

    <li class="level-2">
      <strong>Step 2: Core Features</strong>
      <p class="requires">Requires: Step 1 completion</p>
      <ul>
        <li><a href="/learn/contacts">Contact Management</a> (20 min)</li>
        <li><a href="/learn/pipeline">Pipeline Basics</a> (25 min)</li>
      </ul>
      <p class="next-step">→ Can proceed to Step 3 after completing either</p>
    </li>

    <li class="level-3">
      <strong>Step 3: Advanced Usage</strong>
      <p class="requires">Requires: Step 2 completion (both topics)</p>
      <ul>
        <li><a href="/learn/automation">Automation Rules</a> (30 min)</li>
        <li><a href="/learn/reporting">Reporting & Analytics</a> (25 min)</li>
      </ul>
    </li>
  </ol>
</div>
```

### Machine-Readable Dependency Declarations

**HowTo schema with steps (shows sequence):**
```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Set Up Your First CRM Pipeline",

  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Create Pipeline",
      "text": "Navigate to Settings > Pipelines and click 'New Pipeline'",
      "url": "https://acmecorp.com/docs/create-pipeline"
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Define Stages",
      "text": "Add stages like 'Lead', 'Qualified', 'Proposal', 'Closed'",
      "url": "https://acmecorp.com/docs/define-stages"
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Add First Deal",
      "text": "Create a deal and assign it to the first stage",
      "url": "https://acmecorp.com/docs/add-deal"
    }
  ],

  "totalTime": "PT10M",
  "tool": [
    {
      "@type": "HowToTool",
      "name": "Acme CRM account (Pro plan or higher)"
    }
  ]
}
```

**CourseInstance with prerequisites:**
```json
{
  "@context": "https://schema.org",
  "@type": "CourseInstance",
  "name": "Advanced CRM Strategies - January 2025",

  "courseMode": "online",

  "coursePrerequisites": [
    {
      "@type": "Course",
      "@id": "https://learnplatform.com/courses/crm-fundamentals",
      "name": "CRM Fundamentals"
    }
  ],

  "hasCourseInstance": {
    "@type": "Course",
    "@id": "https://learnplatform.com/courses/advanced-crm",
    "name": "Advanced CRM Strategies"
  }
}
```

**SoftwareApplication with system requirements:**
```json
{
  "@type": "SoftwareApplication",
  "name": "Acme CRM Mobile App",

  "operatingSystem": "iOS 14.0 or later, Android 10.0 or later",

  "softwareRequirements": {
    "@type": "SoftwareApplication",
    "name": "Acme CRM account",
    "description": "Requires active Acme CRM Pro or Enterprise subscription"
  },

  "memoryRequirements": "100 MB available storage",

  "storageRequirements": "100 MB"
}
```

## Conditional Content

### "If-Then" Dependency Structures

**Pattern: Feature availability based on plan**

```html
<section id="api-access">
  <h2>API Access</h2>

  <div class="availability-notice">
    <strong>Availability:</strong> Enterprise plan only
  </div>

  <div class="conditional-content" data-requires-plan="enterprise">
    <p>
      API Access allows programmatic integration with Acme CRM.
    </p>

    <h3>Getting Started with the API</h3>
    <p>To use the API, you'll need:</p>
    <ul>
      <li>Enterprise plan subscription</li>
      <li>API key (generate in Settings > API)</li>
      <li>Basic understanding of REST APIs</li>
    </ul>

    <div class="prerequisites">
      <p><strong>Before using the API:</strong></p>
      <ol>
        <li><a href="#contact-management">Set up Contact Management</a></li>
        <li><a href="#custom-fields">Configure Custom Fields</a> (if needed)</li>
        <li><a href="/docs/api-auth">Review API Authentication</a></li>
      </ol>
    </div>
  </div>

  <div class="upgrade-cta" data-hidden-for-plan="enterprise">
    <p>
      <strong>API Access is available with Enterprise plans.</strong>
    </p>
    <a href="/pricing" class="button">View Enterprise Plans →</a>
  </div>
</section>
```

**Pattern: Sequential onboarding**

```html
<div class="onboarding-checklist">
  <h2>Getting Started Checklist</h2>

  <ol class="checklist">
    <li data-step="1" class="required">
      <input type="checkbox" id="step-1" />
      <label for="step-1">
        <strong>Create your account</strong>
        <p>Sign up and verify your email</p>
      </label>
    </li>

    <li data-step="2" class="required" data-requires="step-1">
      <input type="checkbox" id="step-2" />
      <label for="step-2">
        <strong>Import your contacts</strong>
        <p>Upload CSV or connect to existing tools</p>
      </label>
      <p class="dependency-note">
        <em>Complete Step 1 first</em>
      </p>
    </li>

    <li data-step="3" class="required" data-requires="step-2">
      <input type="checkbox" id="step-3" />
      <label for="step-3">
        <strong>Set up your pipeline</strong>
        <p>Define stages for your sales process</p>
      </label>
      <p class="dependency-note">
        <em>Requires contacts (Step 2)</em>
      </p>
    </li>

    <li data-step="4" class="optional" data-requires="step-3">
      <input type="checkbox" id="step-4" />
      <label for="step-4">
        <strong>Configure automation (optional)</strong>
        <p>Set up automated workflows</p>
      </label>
      <p class="dependency-note">
        <em>Recommended after completing Steps 1-3</em>
      </p>
    </li>
  </ol>
</div>
```

## Dependency Validation

### Automated Dependency Checking

```python
# Dependency validator

class DependencyGraph:
    def __init__(self):
        self.nodes = {}  # topic_id: {name, prereqs, level}
        self.edges = []  # (from_topic, to_topic, relationship)

    def add_topic(self, topic_id, name, level=1, prerequisites=None):
        self.nodes[topic_id] = {
            "name": name,
            "level": level,
            "prerequisites": prerequisites or []
        }

        # Add edges for prerequisites
        if prerequisites:
            for prereq in prerequisites:
                self.edges.append((prereq, topic_id, "prerequisite"))

    def validate_dependencies(self):
        """Check for circular dependencies and orphans."""
        issues = []

        # Check for circular dependencies
        for topic_id in self.nodes:
            if self._has_circular_dependency(topic_id):
                issues.append({
                    "type": "circular_dependency",
                    "topic": topic_id,
                    "severity": "error"
                })

        # Check for missing prerequisites
        for topic_id, topic_data in self.nodes.items():
            for prereq in topic_data["prerequisites"]:
                if prereq not in self.nodes:
                    issues.append({
                        "type": "missing_prerequisite",
                        "topic": topic_id,
                        "missing": prereq,
                        "severity": "error"
                    })

        # Check for level consistency
        for from_topic, to_topic, _ in self.edges:
            from_level = self.nodes[from_topic]["level"]
            to_level = self.nodes[to_topic]["level"]

            if to_level <= from_level:
                issues.append({
                    "type": "level_inconsistency",
                    "message": f"{to_topic} (level {to_level}) depends on "
                               f"{from_topic} (level {from_level}) but should be higher level",
                    "severity": "warning"
                })

        return issues

    def _has_circular_dependency(self, topic_id, visited=None):
        if visited is None:
            visited = set()

        if topic_id in visited:
            return True

        visited.add(topic_id)

        for prereq in self.nodes[topic_id]["prerequisites"]:
            if self._has_circular_dependency(prereq, visited.copy()):
                return True

        return False

    def get_learning_path(self, goal_topic):
        """Generate optimal learning path to reach goal topic."""
        path = []
        self._build_path(goal_topic, path, set())
        return list(reversed(path))

    def _build_path(self, topic_id, path, visited):
        if topic_id in visited:
            return

        visited.add(topic_id)

        # Add prerequisites first
        for prereq in self.nodes[topic_id]["prerequisites"]:
            self._build_path(prereq, path, visited)

        # Then add this topic
        path.append(topic_id)

# Example usage
graph = DependencyGraph()

graph.add_topic("crm-basics", "CRM Basics", level=1)
graph.add_topic("contact-mgmt", "Contact Management", level=2, prerequisites=["crm-basics"])
graph.add_topic("pipeline", "Pipeline Management", level=2, prerequisites=["crm-basics"])
graph.add_topic("automation", "Automation", level=3, prerequisites=["contact-mgmt", "pipeline"])

# Validate
issues = graph.validate_dependencies()
if issues:
    print("Dependency issues found:")
    for issue in issues:
        print(f"  {issue['severity'].upper()}: {issue}")
else:
    print("✓ All dependencies valid")

# Generate learning path
path = graph.get_learning_path("automation")
print(f"Learning path to Automation: {' → '.join(path)}")
# Output: crm-basics → contact-mgmt → pipeline → automation
```

## Case Study: Dependency Transformation

**Company**: Online learning platform, 300+ courses

**Pre-Dependency Chaos:**
- No prerequisite declarations
- Courses presented as flat list
- Students enrolled in advanced courses without fundamentals
- 40% course abandonment rate
- LLMs couldn't recommend course sequences

**LLM Test:**
```
Q: "What courses should I take to learn data science?"
ChatGPT: "LearnPlatform has data science courses but I can't determine the right sequence..."
```

**Implementation (Month 1-3):**

**Step 1: Dependency Mapping**
- Mapped all 300 courses into dependency graph
- Identified 12 learning paths
- Defined prerequisites for 200+ courses
- Established 3-level complexity system

**Step 2: Schema Implementation**
```json
{
  "@type": "Course",
  "name": "Machine Learning with Python",
  "educationalLevel": "Advanced",

  "coursePrerequisites": [
    {"@id": "/courses/python-programming"},
    {"@id": "/courses/statistics-fundamentals"},
    {"@id": "/courses/linear-algebra"}
  ]
}
```

**Step 3: UI Changes**
- Added prerequisite badges
- Created learning path visualizations
- Implemented "Suggested Next Course" based on completions
- Blocked enrollment in advanced courses without prerequisites (with override)

**Results (Month 4):**

**Student outcomes:**
- Course abandonment: 40% → 18% (-55%)
- Course completion rate: 52% → 78% (+50%)
- Student satisfaction: +34%

**LLM Understanding:**
```
Q: "What courses should I take to learn data science?"
ChatGPT: "For data science at LearnPlatform, I recommend this learning path:
  1. Start with Python Programming Fundamentals (8 weeks)
  2. Then take Statistics for Data Science (6 weeks)
  3. Follow with Data Analysis with Pandas (4 weeks)
  4. Next, Machine Learning Fundamentals (10 weeks)
  5. Finally, Advanced Machine Learning (8 weeks)
  Total commitment: ~36 weeks.
  You can also take SQL for Data Science (4 weeks) in parallel with steps 2-3."
```

**Course recommendation accuracy: 23% → 91%** (+68pp)

**Key Insight:** "Making prerequisites explicit transformed random course enrollment into guided learning paths—for humans and AI alike."

## Action Items

- [ ] Identify all prerequisite relationships in your content
- [ ] Add coursePrerequisites or similar dependency schema
- [ ] Create visual learning paths or dependency graphs
- [ ] Implement progressive disclosure for complex topics
- [ ] Add "Prerequisites" sections to advanced content
- [ ] Validate dependencies for circular references
- [ ] Test LLM understanding of content sequences

## Reflection Questions

1. Can users (and LLMs) understand what knowledge is required before diving into advanced topics?
2. Do you have content at multiple complexity levels (beginner, intermediate, advanced)?
3. Are feature dependencies explicit (Feature B requires Feature A)?
4. Can LLMs recommend the right sequence for learning your product?
5. What's the cost of users accessing advanced content without foundational knowledge?

## What's Next

Chapter 9 explores **Progressive Complexity**—structuring content to serve multiple audience levels simultaneously while maintaining clear paths from basic to advanced understanding. You'll learn to create layered content that accommodates beginners without boring experts.

---

**Key Takeaway**: Explicit dependencies guide both learning and machine reasoning. Declare prerequisites using schema markup, create visual learning paths, implement progressive disclosure, and validate dependency graphs. Companies that make dependencies explicit see 40-60% improvement in course completion rates and 3-4× better AI recommendation accuracy. Dependencies transform isolated content into structured knowledge where every piece builds logically on what came before—creating coherent understanding for humans and machines alike.
