function notAvail(v) {
    return (v === undefined || v === null) ? 'Not Available' : v;
}

function formatBytes(b) {
    if (typeof b !== 'number') return 'Not Available';
    if (b < 1024) return b + ' B';
    const kb = b / 1024;
    if (kb < 1024) return kb.toFixed(1) + ' KB';
    const mb = kb / 1024;
    if (mb < 1024) return mb.toFixed(1) + ' MB';
    return (mb / 1024).toFixed(2) + ' GB';
}

async function main() {
    let webgl = {}, webgl2 = {}, webgpu = {};

    {
        const gl = document.createElement('canvas').getContext('webgl') ||
            document.createElement('canvas').getContext('experimental-webgl');
        if (gl) {
            webgl.support = true;
            webgl.tex2d = gl.getParameter(gl.MAX_TEXTURE_SIZE);
            webgl.vert_tex_units = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
            webgl.frag_tex_units = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);

            webgl.attribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);

            webgl.vert_uniforms = formatBytes(gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS) * 16);
            webgl.frag_uniforms = formatBytes(gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS) * 16);

            const dbg = gl.getExtension('WEBGL_debug_renderer_info');
            if (dbg) {
                webgl.vendor = gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL);
                webgl.renderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL);
            }
        } else webgl.support = false;
    }

    {
        const gl2 = document.createElement('canvas').getContext('webgl2');
        if (gl2) {
            webgl2.support = true;
            webgl2.tex2d = gl2.getParameter(gl2.MAX_TEXTURE_SIZE);
            webgl2.tex3d = gl2.getParameter(gl2.MAX_3D_TEXTURE_SIZE);
            webgl2.array_tex = gl2.getParameter(gl2.MAX_ARRAY_TEXTURE_LAYERS);
            webgl2.vert_tex_units = gl2.getParameter(gl2.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
            webgl2.frag_tex_units = gl2.getParameter(gl2.MAX_TEXTURE_IMAGE_UNITS);

            webgl2.attribs = gl2.getParameter(gl2.MAX_VERTEX_ATTRIBS);

            webgl2.vert_uniforms = formatBytes(gl2.getParameter(gl2.MAX_VERTEX_UNIFORM_VECTORS) * 16);
            webgl2.frag_uniforms = formatBytes(gl2.getParameter(gl2.MAX_FRAGMENT_UNIFORM_VECTORS) * 16);
            webgl2.uniforms_size = formatBytes(gl2.getParameter(gl2.MAX_UNIFORM_BLOCK_SIZE));
            webgl2.ubo_per_vertex = gl2.getParameter(gl2.MAX_VERTEX_UNIFORM_BLOCKS);
            webgl2.ubo_per_fragment = gl2.getParameter(gl2.MAX_FRAGMENT_UNIFORM_BLOCKS);
            webgl2.ubo_alignment = formatBytes(gl2.getParameter(gl2.UNIFORM_BUFFER_OFFSET_ALIGNMENT));

            webgl2.render_targets = gl2.getParameter(gl2.MAX_DRAW_BUFFERS);

            const dbg = gl2.getExtension('WEBGL_debug_renderer_info');
            if (dbg) {
                webgl2.vendor = gl2.getParameter(dbg.UNMASKED_VENDOR_WEBGL);
                webgl2.renderer = gl2.getParameter(dbg.UNMASKED_RENDERER_WEBGL);
            }
        } else webgl2.support = false;
    }

    let adapter;

    if ('gpu' in navigator) {
        adapter = await navigator.gpu.requestAdapter();
        if (adapter) {
            const device = await adapter.requestDevice();
            if (device) {
                webgpu.support = true;
                const d = device.limits;

                webgpu.tex2d = d.maxTextureDimension2D;
                webgpu.tex3d = d.maxTextureDimension3D;
                webgpu.array_tex = d.maxTextureArrayLayers;
                webgpu.vert_tex_units = d.maxSampledTexturesPerShaderStage;
                webgpu.frag_tex_units = d.maxSampledTexturesPerShaderStage;

                webgpu.attribs = d.maxVertexAttributes;

                webgpu.ubo_size = formatBytes(d.maxUniformBufferBindingSize);
                webgpu.ubo_per_shader_stage = d.maxUniformBuffersPerShaderStage;
                webgpu.ubo_alignment = formatBytes(d.minUniformBufferOffsetAlignment);

                webgpu.render_targets = d.maxColorAttachments;

                if (adapter.info) {
                    webgpu.vendor = adapter.info.vendor;
                    webgpu.renderer = adapter.info.description + " " + adapter.info.backend;
                }
            }
        } else webgpu.support = false;
    } else webgpu.support = false;

    const sections = [
        {
            title: "Textures", rows: [
                ['Texture Size (2D)', webgl.tex2d, webgl2.tex2d, webgpu.tex2d, adapter?.limits?.maxTextureDimension2D],
                ['Texture Size (3D)', null, webgl2.tex3d, webgpu.tex3d, adapter?.limits?.maxTextureDimension3D],
                ['Array Texture Layers', null, webgl2.array_tex, webgpu.array_tex, adapter?.limits?.maxTextureArrayLayers],
                ['Vertex Texture Units', webgl.vert_tex_units, webgl2.vert_tex_units, webgpu.vert_tex_units, adapter?.limits?.maxSampledTexturesPerShaderStage],
                ['Fragment Texture Units', webgl.frag_tex_units, webgl2.frag_tex_units, webgpu.frag_tex_units, adapter?.limits?.maxSampledTexturesPerShaderStage],
            ]
        },
        {
            title: "Vertex Buffers", rows: [
                ['Vertex Attributes', webgl.attribs, webgl2.attribs, webgpu.attribs, adapter?.limits?.maxVertexAttributes],
            ]
        },
        {
            title: "Uniforms", rows: [
                ['Vertex Uniforms Size', webgl.vert_uniforms, webgl2.vert_uniforms, null, null],
                ['Fragment Uniforms Size', webgl.frag_uniforms, webgl2.frag_uniforms, null, null],
                ['Uniform Buffer Size', null, webgl2.uniforms_size, webgpu.ubo_size, formatBytes(adapter?.limits?.maxUniformBufferBindingSize)],
                ['Uniform Buffers per Vertex', null, webgl2.ubo_per_vertex, webgpu.ubo_per_shader_stage, adapter?.limits?.maxUniformBuffersPerShaderStage],
                ['Uniform Buffers per Fragment', null, webgl2.ubo_per_fragment, webgpu.ubo_per_shader_stage, adapter?.limits?.maxUniformBuffersPerShaderStage],
                ['Uniform Buffer Alignment', null, webgl2.ubo_alignment, webgpu.ubo_alignment, formatBytes(adapter?.limits?.minUniformBufferOffsetAlignment)],
            ]
        },
        {
            title: "Render Targets", rows: [
                ['Render Targets', webgl.render_targets, webgl2.render_targets, webgpu.render_targets, adapter?.limits?.maxColorAttachments],
            ]
        },
        {
            title: "Vendor / Renderer", rows: [
                ['Vendor', webgl.vendor, webgl2.vendor, webgpu.vendor, webgpu.vendor],
                ['Renderer', webgl.renderer, webgl2.renderer, webgpu.renderer, webgpu.renderer],
            ]
        }
    ];

    let html = `<table><tr>
<th>Parameter</th>
<th>WebGL</th>
<th>WebGL2</th>
<th>WebGPU (Device)</th>
<th>WebGPU (Adapter)</th>
</tr>`;

    for (const section of sections) {
        html += `<tr><td colspan="5" style="background:#eee;font-weight:bold;">${section.title}</td></tr>`;
        for (const [name, a, b, c, d] of section.rows) {
            html += `<tr>
            <td>${name}</td>
            <td>${notAvail(a)}</td>
            <td>${notAvail(b)}</td>
            <td>${notAvail(c)}</td>
            <td>${notAvail(d)}</td>
        </tr>`;
        }
    }

    html += `</table>`;

    document.getElementById('gpu_table_container').innerHTML = html;

}

main();
