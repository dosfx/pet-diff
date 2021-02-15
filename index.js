Vue.createApp({
    data() {
        return {
            origPx: -1,
            editPx: -1,
            diffPx: -1,
            percent: -1,
            singleLimb: false,
            twoLimbs: false,
            twoLimbsStack: false,
            centaur: false,
            sittingStanding: false,
            bodyExtension: false,
            serafexHead: false,
            wholeBody: false
        }
    },
    computed: {
        calcDisabled() {
            return this.origPx < 0 || this.editPx < 0 || this.diffPx < 0;
        },
        calcComplete() {
            return this.percent >= 0;
        }
    },
    watch: {
        twoLimbs(value, old) {
            let collapse = new bootstrap.Collapse(document.getElementById("twoLimbsStackCollapse"), { toggle: false });
            if (value) {
                collapse.show();
            } else {
                collapse.hide();
            }
        }
    },
    methods: {
        origChanged(e) {
            this.percent = -1;
            this.origPx = e.pixels;
        },
        editChanged(e) {
            this.percent = -1;
            this.editPx = e.pixels;
        },
        diffChanged(e) {
            this.percent = -1;
            this.diffPx = e.pixels;
        },
        calculate() {
            if (this.calcDisabled) {
                return;
            }
            let modifiedDiff = this.diffPx * 0.75;
            let baseAve = (this.origPx + this.editPx) / 2;
            this.percent = Math.round((modifiedDiff / baseAve) * 10000) / 100;
        }
    }
}).component("file-input", {
    emits: ["changed"],
    props: ["id"],
    data() {
        return {
            image: null,
            imagePx: 0,
            totalPx: 0
        }
    },
    methods: {
        fileChanged(e) {
            if (e.target.files.length === 0) {
                return;
            }
            let urlReader = new FileReader();
            urlReader.addEventListener("load", (e) => {
                this.$data.image = e.target.result;
            });
            urlReader.readAsDataURL(e.target.files[0]);
            let arrReader = new FileReader();
            arrReader.addEventListener("load", (e) => {
                let image = new png.PNG();
                image.on("parsed", (data) => {
                    let count = 0;
                    for (let i = 3; i < data.length; i += 4) {
                        if (data[i] > 0) {
                            count++;
                        }
                    }
                    this.imagePx = count;
                    this.totalPx = image.width * image.height;
                    this.$emit("changed", { id: this.id, pixels: count });
                });
                image.parse(e.target.result);
            });
            arrReader.readAsArrayBuffer(e.target.files[0]);
        }
    },
    template: `
        <div>
            <label v-bind:for="id" class="form-label"><slot></slot></label>
            <input class="form-control mb-2" type="file" v-bind:id="id" accept=".png,image/png" v-on:change="fileChanged">
            <div class="mb-2">
                <img v-if="image" v-bind:src="image" class="img-fluid" />
            </div>
            <div v-if="image" class="border rounded mb-2">
                <table class="table table-striped table-sm mb-0">
                    <tbody>
                        <tr>
                            <td>Pixels</td>
                            <td>{{imagePx}}</td>
                        </tr>
                        <tr>
                            <td>Total</td>
                            <td>{{totalPx}}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>`
}).component("checkbox", {
    props: [
        "disabled",
        "modelValue"
    ],
    emits: ["update:modelValue"],
    computed: {
        id() {
            return "cb" + this.$.uid;
        },
        collapseId() {
            return this.id + "Collapse";
        },
        hasHelp() {
            return this.$slots.help;
        },
        value: {
            get() {
                return this.modelValue;
            },
            set(value) {
                this.$emit("update:modelValue", value);
            }
        }
    },
    template: `
        <div>
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" v-bind:id="id" v-model="value" v-bind:disabled="disabled">
                <label class="form-check-label" v-bind:for="id">
                    <slot name="label">Checkbox</slot>
                    <a v-if="hasHelp" class="bi-question-circle-fill align-text-bottom ms-1" v-bind:href="'#' + collapseId" data-bs-toggle="collapse" 
                        role="button" aria-expanded="false" v-bind:aria-controls="collapseId"></a>
                </label>
            </div>
            <div v-if="hasHelp" v-bind:id="collapseId" class="collapse">
                <p class="border-bottom">
                    <slot name="help"></slot>
                </p>
            </div>
        </div>
    `
}).mount("#app");
