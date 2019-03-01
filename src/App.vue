<template>
    <div class="balmui-container">
        <ui-toolbar>
            <ui-toolbar-row>
                <ui-toolbar-section align="start">
                    <!-- <ui-toolbar-anchor type="menu"></ui-toolbar-anchor> -->
                    <ui-toolbar-title>Photohook</ui-toolbar-title>
                </ui-toolbar-section>

                <ui-toolbar-section align="end" noTitle>
                    <!-- <ui-toolbar-anchor
            href="javascript:void(0)"
            alt="Download"
          >file_download</ui-toolbar-anchor> -->
                </ui-toolbar-section>
            </ui-toolbar-row>
        </ui-toolbar>

        <main class="balmui-content">
            <section>
                <p :class="$tt('body2')">{{ urls.length }} 枚の画像が見つかりました</p>

                <ui-image-list withTextProtection>
                    <ui-image-item
                        block
                        class="image-item"
                        v-for="(url, i) in urls"
                        :key="i"
                        :src="url"
                    >
                        <ui-image-supporting>Text label</ui-image-supporting>
                    </ui-image-item>
                </ui-image-list>

                <p :class="$tt('body2')">
                    <ui-icon-button icon="file_download"></ui-icon-button>
                </p>
            </section>
        </main>
    </div>
</template>

<style></style>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { extractTargetURLsFromLocation } from './utils'
import Main from './Main.vue'

@Component({
    components: {
        Main,
    },
})
export default class App extends Vue {
    isLoggedIn: boolean = false

    urls: string[] = []

    created() {
        this.urls = extractTargetURLsFromLocation(location)
    }

    mightLogin() {}
}
</script>
